import React, { useState, useEffect, useRef } from 'react';
import FlashcardList from './FlashList';
import './App.css'
import axios from 'axios'

function App() {
  const [flashcards, setFlashcards] = useState([])
  const [categories, setCategories] = useState([])

  const categoryEl = useRef()
  const amountEl = useRef()

  useEffect(() => {
    axios
      .get('https://opentdb.com/api_category.php')
      .then(res => {
        setCategories(res.data.trivia_categories)
      })
  }, [])

  function decodeString(str) {
    const textArea = document.createElement('textarea')
    textArea.innerHTML = str
    return textArea.value
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const res = await makeRequestWithRetry({
        url: 'https://opentdb.com/api.php',
        params: {
          amount: amountEl.current.value,
          category: categoryEl.current.value
        }
      });

      setFlashcards(res.data.results.map((questionItem, index) => {
        const answer = decodeString(questionItem.correct_answer)
        const options = [
          ...questionItem.incorrect_answers.map(a => decodeString(a)),
          answer
        ]
        return {
          id: `${index}-${Date.now()}`,
          question: decodeString(questionItem.question),
          answer: answer,
          options: options.sort(() => Math.random() - .5)
        }
      }))
    } catch (error) {
      console.error('Failed to fetch questions', error);
    }
  }

  async function makeRequestWithRetry(options, retries = 5, delay = 1000) {
    try {
      const response = await axios(options);
      return response;
    } catch (error) {
      if (error.response && error.response.status === 429 && retries > 0) {
        console.warn(`Rate limit exceeded. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return makeRequestWithRetry(options, retries - 1, delay * 2); // Exponential backoff
      }
      throw error;
    }
  }

  return (
    <>
      <form className="header" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" ref={categoryEl}>
            {categories.map(category => {
              return <option value={category.id} key={category.id}>{category.name}</option>
            })}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="amount">Number of Questions</label>
          <input type="number" id="amount" min="1" step="1" defaultValue={10} ref={amountEl} />
        </div>
        <div className="form-group">
          <button className="btn">Generate</button>
        </div>
      </form>
      <div className="container">
        <FlashcardList flashcards={flashcards} />
      </div>
    </>
  );
}

export default App;
