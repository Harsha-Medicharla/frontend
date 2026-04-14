// Questions.js
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase/supabase';
const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const contestId = useParams()

  const handleAddQuestion = () => {
    
    const newQuestion = {
      id: ' ',
      title : '',
      category: '',
      difficulty: '',
      problem_statement: '',
      constraints: '',
      examples: [
        { id: 0, inputText: '', outputText: '' },
        { id: 1, inputText: '', outputText: '' }
      ],
      inputs: [],
      outputs: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleTestcaseInputChange = (questionId, value) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(question =>
        question.id === questionId ? { ...question, inputs: value.split('\\') } : question
      )
    );
  };

  const handleTestcaseOutputChange = (questionId, value) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(question =>
        question.id === questionId ? { ...question, outputs: value.split('\\') } : question
      )
    );
  };

  const handleChange = (questionId, field, value) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question) =>
        question.id === questionId ? { ...question, [field]: value } : question
      )
    );
  };

  const handleExampleChange = (questionId, exampleId, field, value) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              examples: question.examples.map((example) =>
                example.id === exampleId ? { ...example, [field]: value } : example
              )
            }
          : question
      )
    );
  };

  const handleSubmit = async () => {
    try {
      console.log(questions)
        const { data, error } = await supabase.from('hostcontests').update("questions",questions).eq("id",contestId);
        if (error) {
          console.error('Error inserting questions:', error.message);
        } else {
          console.log('Questions inserted successfully:', data);
        }
    } catch (error) {
        console.error('Error inserting questions:', error.message);
    }
};


  return (
    <div>
      {questions.map((question) => (
        <div key={question.id} className="my-4 border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Question {question.id + 1}</h2>
          <div className="mb-4">
            <label htmlFor={`category-${question.id}`} className="block font-semibold mb-1">Problem Title</label>
            <input
              type="text"
              id={`category-${question.id}`}
              value={question.title}
              onChange={(e) => handleChange(question.id, 'title', e.target.value)}
              className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor={`category-${question.id}`} className="block font-semibold mb-1">Category</label>
            <input
              type="text"
              id={`category-${question.id}`}
              value={question.category}
              onChange={(e) => handleChange(question.id, 'category', e.target.value)}
              className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>
          {/* Add fields for difficulty, problem statement, constraints */}
          <div className="mb-4">
            <label htmlFor={`problemStatement-${question.id}`} className="block font-semibold mb-1">Problem Statement</label>
            <textarea
              id={`problemStatement-${question.id}`}
              value={question.problem_statement}
              onChange={(e) => handleChange(question.id, 'problem_statement', e.target.value)}
              className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
              rows="4"
            />
          </div>
          <div className="mb-4">
            <label htmlFor={`constraints-${question.id}`} className="block font-semibold mb-1">Constraints</label>
            <input
              type="text"
              id={`constraints-${question.id}`}
              value={question.constraints}
              onChange={(e) => handleChange(question.id, 'constraints', e.target.value)}
              className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>
          {/* Examples input */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">Examples</label>
            {question.examples.map((example) => (
              <div key={example.id}>
                <div className="mb-2">
                  <label htmlFor={`input-${question.id}-${example.id}`} className="block font-semibold mb-1">Input</label>
                  <input
                    type="text"
                    id={`input-${question.id}-${example.id}`}
                    value={example.inputText}
                    onChange={(e) => handleExampleChange(question.id, example.id, 'inputText', e.target.value)}
                    className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="mb-2">
                  <label htmlFor={`output-${question.id}-${example.id}`} className="block font-semibold mb-1">Output</label>
                  <input
                    type="text"
                    id={`output-${question.id}-${example.id}`}
                    value={example.outputText}
                    onChange={(e) => handleExampleChange(question.id, example.id, 'outputText', e.target.value)}
                    className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
        
          </div>
          <div className="mb-4">
            <label htmlFor={`inputs-${question.id}`} className="block font-semibold mb-1">Test Case Inputs (Separate each parameter with '\')</label>
            <input
              type="text"
              id={`inputs-${question.id}`}
              value={question.inputs.join('\\')}
              onChange={e => handleTestcaseInputChange(question.id, e.target.value)}
              className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor={`outputs-${question.id}`} className="block font-semibold mb-1">Test Case Outputs (Separate each parameter with '\')</label>
            <input
              type="text"
              id={`outputs-${question.id}`}
              value={question.outputs.join('\\')}
              onChange={e => handleTestcaseOutputChange(question.id, e.target.value)}
              className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>
        </div>
      ))}
      <button onClick={handleAddQuestion} className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 mr-2">Add Question</button>
      <button onClick={handleSubmit} className="bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-600">Submit Questions</button>
    </div>
  );
};

export default Questions;
