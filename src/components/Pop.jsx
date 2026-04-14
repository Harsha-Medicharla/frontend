import React, { useState } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root"); // Necessary for accessibility

const PopupForm = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <button
        onClick={() => setModalIsOpen(true)}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        Open Form
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="bg-white p-6 rounded-lg shadow-xl w-96 mx-auto"
        overlayClassName="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      >
        <h2 className="text-xl font-semibold mb-4">Contact Form</h2>
        <form>
          <label className="block mb-2">
            Name:
            <input
              type="text"
              className="w-full border rounded p-2 mt-1"
              placeholder="Enter your name"
            />
          </label>
          <label className="block mb-2">
            Email:
            <input
              type="email"
              className="w-full border rounded p-2 mt-1"
              placeholder="Enter your email"
            />
          </label>
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={() => setModalIsOpen(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PopupForm;
