// package.json
{
  "name": "my-trello-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "firebase": "^10.12.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "vite": "^5.3.1"
  }
}

// public/index.html
<!DOCTYPE html>
<html lang="pt">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Aplicação Trello Clone Avançada"
    />
    <title>App Hub - Trello Pro</title>
  </head>
  <body>
    <noscript>Precisa de ativar o JavaScript para executar esta aplicação.</noscript>
    <div id="root"></div>
    <script type="module" src="/src/index.js"></script>
  </body>
</html>

// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Importa o CSS do Tailwind
import App from './App.jsx'; // Certifique-se de que o nome do ficheiro é App.jsx

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom scrollbar for better aesthetics */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Shadow text for headers */
.drop-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}


// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});

// src/App.jsx
import React, { useState, useEffect } from 'react';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebaseConfig'; // Importa db e auth
import TrelloBoards from './components/TrelloBoards'; // Importa o componente TrelloBoards
import ConfirmationModal from './components/ConfirmationModal'; // Importa o ConfirmationModal

// Variáveis globais fornecidas pelo ambiente Canvas
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Componente Principal do Aplicativo
function App() {
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationAction, setConfirmationAction] = useState(null);

  // Efeito para autenticação e configuração do listener de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
          } else {
            await signInAnonymously(auth);
          }
        } catch (error) {
          console.error("Erro ao autenticar:", error);
          showUserMessage("Erro ao autenticar. Por favor, tente novamente.");
        }
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const showUserMessage = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
  };

  const confirmAction = (message) => {
    return new Promise((resolve) => {
      setConfirmationMessage(message);
      setConfirmationAction(() => resolve);
      setShowConfirmationModal(true);
    });
  };

  const handleConfirmationResponse = (confirmed) => {
    setShowConfirmationModal(false);
    if (confirmationAction) {
      confirmationAction(confirmed);
      setConfirmationAction(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-inter text-gray-800">
      {/* Header Global */}
      <header className="bg-blue-700 p-4 text-white shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Logo/Ícone */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-100" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <h1 className="text-2xl font-extrabold drop-shadow-md">App Hub</h1>
        </div>
        {userId && (
          <div className="text-sm opacity-80">
            ID do Utilizador: <span className="font-mono bg-white bg-opacity-20 px-2 py-1 rounded-md">{userId.substring(0, 6)}...</span>
          </div>
        )}
      </header>

      {/* Modal de Mensagem (para avisos/sucesso) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center border border-gray-200">
            <p className="text-lg font-semibold text-gray-800 mb-4">{modalMessage}</p>
            <button
              onClick={closeModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {showConfirmationModal && (
        <ConfirmationModal
          message={confirmationMessage}
          onConfirm={() => handleConfirmationResponse(true)}
          onCancel={() => handleConfirmationResponse(false)}
        />
      )}

      {/* Conteúdo Principal (Apenas TrelloBoards) */}
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full">
        {isAuthReady ? (
          <TrelloBoards
            userId={userId}
            showUserMessage={showUserMessage}
            confirmAction={confirmAction}
            appId={appId}
          />
        ) : (
          <p className="text-center text-white text-lg mt-10">A carregar...</p>
        )}
      </main>
    </div>
  );
}

export default App;


// src/components/TrelloBoards.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Importa db
import Board from './Board'; // Importa o componente Board
import { BOARD_BACKGROUNDS } from '../constants'; // Importa as constantes

function TrelloBoards({ userId, showUserMessage, confirmAction, appId }) {
  const [boards, setBoards] = useState([]);
  const [currentBoardId, setCurrentBoardId] = useState(null);
  const [newBoardName, setNewBoardName] = useState('');

  // Estado para edição de nome do quadro
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editedBoardName, setEditedBoardName] = useState('');

  useEffect(() => {
    if (!userId) return;

    const boardsCollectionRef = collection(db, `artifacts/${appId}/public/data/boards`);
    const q = query(boardsCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBoards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBoards(fetchedBoards);
      if (fetchedBoards.length > 0 && !currentBoardId) {
        setCurrentBoardId(fetchedBoards[0].id);
      } else if (fetchedBoards.length === 0) {
        setCurrentBoardId(null);
      }
    }, (error) => {
      console.error("Erro ao carregar quadros:", error);
      showUserMessage("Erro ao carregar quadros. Por favor, tente novamente.");
    });

    return () => unsubscribe();
  }, [userId, currentBoardId]);

  const handleCreateBoard = async () => {
    if (newBoardName.trim() === '') {
      showUserMessage("O nome do quadro não pode estar vazio.");
      return;
    }
    if (!userId) {
      showUserMessage("Utilizador não autenticado. Por favor, aguarde.");
      return;
    }

    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/boards`), {
        name: newBoardName,
        createdAt: new Date(),
        createdBy: userId,
        background: BOARD_BACKGROUNDS[0], // Default background
      });
      setNewBoardName('');
      showUserMessage("Quadro criado com sucesso!");
    } catch (e) {
      console.error("Erro ao adicionar quadro: ", e);
      showUserMessage("Erro ao criar quadro. Por favor, tente novamente.");
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (!userId) {
      showUserMessage("Utilizador não autenticado. Por favor, aguarde.");
      return;
    }

    try {
      const listsCollectionRef = collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists`);
      const listsSnapshot = await getDocs(listsCollectionRef);
      for (const listDoc of listsSnapshot.docs) {
        const cardsSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listDoc.id}/cards`));
        for (const cardDoc of cardsSnapshot.docs) {
          // Excluir subcoleções de comentários e atividades antes de excluir o cartão
          const commentsSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listDoc.id}/cards/${cardDoc.id}/comments`));
          for (const commentDoc of commentsSnapshot.docs) {
            await deleteDoc(doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listDoc.id}/cards/${cardDoc.id}/comments`, commentDoc.id));
          }
          const activitiesSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listDoc.id}/cards/${cardDoc.id}/activities`));
          for (const activityDoc of activitiesSnapshot.docs) {
            await deleteDoc(doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listDoc.id}/cards/${cardDoc.id}/activities`, activityDoc.id));
          }
          await deleteDoc(doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listDoc.id}/cards`, cardDoc.id));
        }
        await deleteDoc(doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists`, listDoc.id));
      }
      await deleteDoc(doc(db, `artifacts/${appId}/public/data/boards`, boardId));
      showUserMessage("Quadro e todo o seu conteúdo excluídos com sucesso!");
    } catch (e) {
      console.error("Erro ao excluir quadro: ", e);
      showUserMessage("Erro ao excluir quadro. Por favor, tente novamente.");
    }
  };

  const handleEditBoardName = (board) => {
    setEditingBoardId(board.id);
    setEditedBoardName(board.name);
  };

  const handleSaveBoardName = async (boardId) => {
    if (editedBoardName.trim() === '') {
      showUserMessage("O nome do quadro não pode estar vazio.");
      return;
    }
    if (!userId) {
      showUserMessage("Utilizador não autenticado. Por favor, aguarde.");
      return;
    }

    try {
      await updateDoc(doc(db, `artifacts/${appId}/public/data/boards`, boardId), {
        name: editedBoardName,
      });
      setEditingBoardId(null);
      setEditedBoardName('');
      showUserMessage("Nome do quadro atualizado com sucesso!");
    } catch (e) {
      console.error("Erro ao atualizar nome do quadro: ", e);
      showUserMessage("Erro ao atualizar nome do quadro. Por favor, tente novamente.");
    }
  };

  const handleCancelEditBoardName = () => {
    setEditingBoardId(null);
    setEditedBoardName('');
  };

  const handleUpdateBoardBackground = async (boardId, newBackground) => {
    if (!userId) {
      showUserMessage("Utilizador não autenticado. Por favor, aguarde.");
      return;
    }
    try {
      await updateDoc(doc(db, `artifacts/${appId}/public/data/boards`, boardId), {
        background: newBackground,
      });
      showUserMessage("Fundo do quadro atualizado!");
    } catch (e) {
      console.error("Erro ao atualizar fundo do quadro:", e);
      showUserMessage("Erro ao atualizar fundo do quadro. Por favor, tente novamente.");
    }
  };

  return (
    <div className="bg-white bg-opacity-95 p-6 rounded-xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Os Seus Quadros</h2>

      {/* Criação de Novo Quadro */}
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
        <input
          type="text"
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 placeholder-gray-500 text-gray-800"
          placeholder="Nome do novo quadro"
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCreateBoard()}
        />
        <button
          onClick={handleCreateBoard}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          Criar Quadro
        </button>
      </div>

      {/* Seleção de Quadros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.length === 0 && <p className="text-gray-600 col-span-full text-center py-4">Nenhum quadro encontrado. Crie um novo!</p>}
        {boards.map((board) => (
          <div
            key={board.id}
            className={`flex items-center justify-between p-4 rounded-lg shadow-md cursor-pointer transition duration-200 ease-in-out border
              ${currentBoardId === board.id ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-500' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'}`}
            onClick={() => setCurrentBoardId(board.id)}
          >
            {editingBoardId === board.id ? (
              <input
                type="text"
                value={editedBoardName}
                onChange={(e) => setEditedBoardName(e.target.value)}
                onBlur={() => handleSaveBoardName(board.id)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveBoardName(board.id)}
                className="flex-grow p-1 border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 text-lg font-semibold text-gray-700"
                autoFocus
              />
            ) : (
              <span className="font-semibold text-lg text-gray-700 truncate">{board.name}</span>
            )}
            <div className="flex items-center space-x-2 ml-4">
              {editingBoardId !== board.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditBoardName(board);
                  }}
                  className="text-gray-500 hover:text-blue-700 transition duration-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                  title="Editar Nome do Quadro"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-1.414 1.414L10 6.172 3.879 12.293a1 1 0 00-.329.673V16.5a1 1 0 001 1h.534a1 1 0 00.673-.329L13.828 9l-1.414-1.414z" />
                  </svg>
                </button>
              )}
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const confirmed = await confirmAction(`Tem certeza que deseja excluir o quadro "${board.name}"? Isso também excluirá todas as listas e cartões dentro dele.`);
                  if (confirmed) {
                    handleDeleteBoard(board.id);
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                title="Excluir Quadro"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 01-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {currentBoardId && (
        <Board
          boardId={currentBoardId}
          userId={userId}
          showUserMessage={showUserMessage}
          confirmAction={confirmAction}
          appId={appId}
          db={db}
          onUpdateBoardBackground={handleUpdateBoardBackground}
          currentBoard={boards.find(b => b.id === currentBoardId)} // Pass current board data
        />
      )}
    </div>
  );
}

export default TrelloBoards;


// src/components/Board.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Importa db
import CardList from './CardList'; // Importa o componente CardList
import { BOARD_BACKGROUNDS } from '../constants'; // Importa as constantes

function Board({ boardId, userId, showUserMessage, confirmAction, appId, db, onUpdateBoardBackground, currentBoard }) {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [editedListName, setEditedListName] = useState('');
  const [draggedListId, setDraggedListId] = useState(null);
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [showArchivedCards, setShowArchivedCards] = useState(false);

  useEffect(() => {
    if (!boardId) return;

    const listsCollectionRef = collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists`);
    const q = query(listsCollectionRef, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLists(fetchedLists);
    }, (error) => {
      console.error("Erro ao carregar listas:", error);
      showUserMessage("Erro ao carregar listas. Por favor, tente novamente.");
    });

    return () => unsubscribe();
  }, [boardId]);

  const handleAddList = async () => {
    if (newListName.trim() === '') {
      showUserMessage("O nome da lista não pode estar vazio.");
      return;
    }
    if (!userId) {
      showUserMessage("Utilizador não autenticado. Por favor, aguarde.");
      return;
    }

    try {
      const listsCollectionRef = collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists`);
      const q = query(listsCollectionRef, orderBy('order', 'desc'));
      const snapshot = await getDocs(q);
      const highestOrder = snapshot.empty ? 0 : snapshot.docs[0].data().order;
      const newOrder = highestOrder + 10;

      await addDoc(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists`), {
        name: newListName,
        boardId: boardId,
        createdAt: new Date(),
        createdBy: userId,
        order: newOrder,
      });
      setNewListName('');
      showUserMessage("Lista adicionada com sucesso!");
    }
    catch (e) {
      console.error("Erro ao adicionar lista: ", e);
      showUserMessage("Erro ao adicionar lista. Por favor, tente novamente.");
    }
  };

  const handleDeleteList = async (listId) => {
    if (!userId) {
      showUserMessage("Utilizador não autenticado. Por favor, aguarde.");
      return;
    }

    try {
      const cardsSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards`));
      for (const cardDoc of cardsSnapshot.docs) {
        const commentsSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards/${cardDoc.id}/comments`));
        for (const commentDoc of commentsSnapshot.docs) {
          await deleteDoc(doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards/${cardDoc.id}/comments`, commentDoc.id));
        }
        const activitiesSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards/${cardDoc.id}/activities`));
        for (const activityDoc of activitiesSnapshot.docs) {
          await deleteDoc(doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards/${cardDoc.id}/activities`, activityDoc.id));
        }
        await deleteDoc(doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards`, cardDoc.id));
      }
      await deleteDoc(doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists`, listId));
      showUserMessage("Lista e os seus cartões excluídos com sucesso!");
    } catch (e) {
      console.error("Erro ao excluir lista: ", e);
      showUserMessage("Erro ao excluir lista. Por favor, tente novamente.");
    }
  };

  const handleEditListName = (list) => {
    setEditingListId(list.id);
    setEditedListName(list.name);
  };

  const handleSaveListName = async (listId) => {
    if (editedListName.trim() === '') {
      showUserMessage("O nome da lista não pode estar vazio.");
      return;
    }
    if (!userId) {
      showUserMessage("Utilizador não autenticado. Por favor, aguarde.");
      return;
    }

    try {
      await updateDoc(doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists`, listId), {
        name: editedListName,
      });
      setEditingListId(null);
      setEditedListName('');
      showUserMessage("Nome da lista atualizado com sucesso!");
    } catch (e) {
      console.error("Erro ao atualizar nome da lista: ", e);
      showUserMessage("Erro ao atualizar nome da lista. Por favor, tente novamente.");
    }
  };

  const handleCancelEditListName = () => {
    setEditingListId(null);
    setEditedListName('');
  };

  // Drag and Drop Handlers for Lists
  const handleDragStartList = (e, listId) => {
    setDraggedListId(listId);
    e.dataTransfer.setData('draggedListId', listId);
  };

  const handleDragOverList = (e) => {
    e.preventDefault(); // Allow drop
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropList = async (e, targetListId) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('draggedListId');
    if (!draggedId || draggedId === targetListId) {
      setDraggedListId(null);
      return;
    }

    const sourceList = lists.find(list => list.id === draggedId);
    const targetList = lists.find(list => list.id === targetListId);

    if (!sourceList || !targetList) {
        setDraggedListId(null);
        return;
    }

    const targetIndex = lists.findIndex(list => list.id === targetListId);
    const draggedIndex = lists.findIndex(list => list.id === draggedId);

    if (targetIndex === -1 || draggedIndex === -1) {
        setDraggedListId(null);
        return;
    }

    const reorderedLists = Array.from(lists);
    const [movedList] = reorderedLists.splice(draggedIndex, 1);
    reorderedLists.splice(targetIndex, 0, movedList);

    const batch = writeBatch(db);
    reorderedLists.forEach((list, index) => {
        const listDocRef = doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists`, list.id);
        batch.update(listDocRef, { order: index * 10 }); // Re-assign order in increments of 10
    });

    try {
        await batch.commit();
        showUserMessage("Lista movida com sucesso!");
    } catch (error) {
        console.error("Erro ao mover lista:", error);
        showUserMessage("Erro ao mover lista. Por favor, tente novamente.");
    } finally {
        setDraggedListId(null);
    }
  };

  const handleBoardMenuToggle = () => {
    setShowBoardMenu(!showBoardMenu);
  };

  const handleBackgroundChange = async (color) => {
    if (!userId) {
      showUserMessage("Utilizador não autenticado. Por favor, aguarde.");
      return;
    }
    try {
      await updateDoc(doc(db, `artifacts/${appId}/public/data/boards`, boardId), {
        background: color,
      });
      showUserMessage("Fundo do quadro atualizado!");
    } catch (e) {
      console.error("Erro ao atualizar fundo do quadro:", e);
      showUserMessage("Erro ao atualizar fundo do quadro. Por favor, tente novamente.");
    }
    setShowBoardMenu(false);
  };

  const boardStyle = currentBoard?.background ? { backgroundColor: currentBoard.background } : {};

  return (
    <div className="p-6 rounded-xl shadow-xl border border-gray-100 min-h-[calc(100vh-180px)] flex flex-col" style={boardStyle}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white drop-shadow">{currentBoard?.name}</h2>
        <div className="relative">
          <button
            onClick={handleBoardMenuToggle}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            title="Menu do Quadro"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {showBoardMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-10 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 px-4 py-2 border-b">Menu do Quadro</h3>
              <div className="px-4 py-3">
                <p className="text-sm text-gray-700 mb-2">Mudar Fundo:</p>
                <div className="flex flex-wrap gap-2">
                  {BOARD_BACKGROUNDS.map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full shadow-md border border-gray-300 hover:scale-110 transition duration-150"
                      style={{ backgroundColor: color }}
                      onClick={() => handleBackgroundChange(color)}
                      title={color}
                    ></button>
                  ))}
                </div>
              </div>
              <div className="border-t mt-2 pt-2">
                <button
                  onClick={() => { setShowArchivedCards(!showArchivedCards); setShowBoardMenu(false); }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-150"
                >
                  {showArchivedCards ? 'Ocultar Cartões Arquivados' : 'Mostrar Cartões Arquivados'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exibição das Listas */}
      <div className="flex flex-wrap gap-6 overflow-x-auto pb-4 flex-grow">
        {lists.length === 0 && <p className="text-gray-600 text-center w-full py-4">Nenhuma lista encontrada. Adicione uma nova!</p>}
        {lists.map((list) => (
          <div
            key={list.id}
            className={`bg-gray-100 p-4 rounded-xl shadow-md min-w-[280px] max-w-[320px] flex-shrink-0 border border-gray-200
              ${draggedListId === list.id ? 'opacity-50 border-dashed border-blue-500' : ''}`}
            draggable="true"
            onDragStart={(e) => handleDragStartList(e, list.id)}
            onDragOver={handleDragOverList}
            onDrop={(e) => handleDropList(e, list.id)}
          >
            <div className="flex justify-between items-center mb-4">
              {editingListId === list.id ? (
                <input
                  type="text"
                  value={editedListName}
                  onChange={(e) => setEditedListName(e.target.value)}
                  onBlur={() => handleSaveListName(list.id)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveListName(list.id)}
                  className="flex-grow p-1 border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 text-lg font-semibold text-gray-800"
                  autoFocus
                />
              ) : (
                <h3 className="text-lg font-semibold text-gray-800 truncate">{list.name}</h3>
              )}
              <div className="flex items-center space-x-2 ml-4">
                {editingListId !== list.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditListName(list);
                    }}
                    className="text-gray-500 hover:text-blue-700 transition duration-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                    title="Editar Nome da Lista"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-1.414 1.414L10 6.172 3.879 12.293a1 1 0 00-.329.673V16.5a1 1 0 001 1h.534a1 1 0 00.673-.329L13.828 9l-1.414-1.414z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={async () => {
                    const confirmed = await confirmAction(`Tem certeza que deseja excluir a lista "${list.name}"? Isso também excluirá todos os cartões dentro dela.`);
                    if (confirmed) {
                      handleDeleteList(list.id);
                    }
                  }}
                  className="text-red-500 hover:text-red-700 transition duration-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                  title="Excluir Lista"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 01-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <CardList
              boardId={boardId}
              listId={list.id}
              userId={userId}
              showUserMessage={showUserMessage}
              confirmAction={confirmAction} // Pass confirmAction to CardList
              lists={lists}
              appId={appId}
              db={db}
              showArchivedCards={showArchivedCards}
            />
          </div>
        ))}
        {/* Adicionar Nova Lista */}
        <div className="min-w-[280px] max-w-[320px] flex-shrink-0 p-4 bg-gray-200 rounded-xl shadow-md flex flex-col justify-between">
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 placeholder-gray-500 text-gray-800 mb-4"
            placeholder="Nome da nova lista"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddList()}
          />
          <button
            onClick={handleAddList}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            Adicionar Lista
          </button>
        </div>
      </div>
    </div>
  );
}

// src/components/CardList.jsx
import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Importa db
import CardDetailModal from './CardDetailModal'; // Importa o CardDetailModal
import { getDueDateClass } from '../utils'; // Importa a função utilitária
import { serverTimestamp } from 'firebase/firestore'; // Importa serverTimestamp

function CardList({ boardId, listId, userId, showUserMessage, confirmAction, lists, appId, db, showArchivedCards }) {
  const [cards, setCards] = useState([]);
  const [newCardContent, setNewCardContent] = useState('');
  const [selectedCard, setSelectedCard] = useState(null); // Para o modal de detalhes do cartão

  // Estado para drag and drop de cartões
  const [draggedCardId, setDraggedCardId] = useState(null);
  const [draggedSourceListId, setDraggedSourceListId] = useState(null);


  useEffect(() => {
    if (!boardId || !listId) return;

    const cardsCollectionRef = collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards`);
    const q = query(cardsCollectionRef, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Filter based on showArchivedCards
      setCards(fetchedCards.filter(card => showArchivedCards ? card.isArchived : !card.isArchived));
    }, (error) => {
      console.error("Erro ao carregar cartões:", error);
      showUserMessage("Erro ao carregar cartões. Por favor, tente novamente.");
    });

    return () => unsubscribe();
  }, [boardId, listId, showArchivedCards]); // Add showArchivedCards to dependency array

  const handleAddCard = async () => {
    if (newCardContent.trim() === '') {
      showUserMessage("O conteúdo do cartão não pode estar vazio.");
      return;
    }
    if (!userId) {
      showUserMessage("Utilizador não autenticado. Por favor, aguarde.");
      return;
    }

    try {
      const cardsCollectionRef = collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards`);
      const q = query(cardsCollectionRef, orderBy('order', 'desc'));
      const snapshot = await getDocs(q);
      const highestOrder = snapshot.empty ? 0 : snapshot.docs[0].data().order;
      const newOrder = highestOrder + 10;

      const newCardRef = await addDoc(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards`), {
        content: newCardContent,
        listId: listId,
        boardId: boardId,
        createdAt: new Date(),
        createdBy: userId,
        description: '',
        dueDate: null,
        labels: [],
        assignedTo: '',
        order: newOrder,
        isArchived: false, // New field for archiving
        coverImage: '', // New field for cover image
        checklist: [], // New field for checklist
      });

      // Adicionar atividade de criação do cartão
      await addDoc(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards/${newCardRef.id}/activities`), {
        type: 'card_created',
        description: `Cartão "${newCardContent}" criado.`,
        timestamp: serverTimestamp(),
        userId: userId,
      });

      setNewCardContent('');
      showUserMessage("Cartão adicionado com sucesso!");
    } catch (e) {
      console.error("Erro ao adicionar cartão: ", e);
      showUserMessage("Erro ao adicionar cartão. Por favor, tente novamente.");
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!userId) {
      showUserMessage("Utilizador não autenticado. Por favor, aguarde.");
      return;
    }

    try {
      const commentsSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards/${cardId}/comments`));
      for (const commentDoc of commentsSnapshot.docs) {
        await deleteDoc(doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards/${cardId}/comments`, commentDoc.id));
      }
      const activitiesSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards/${cardId}/activities`));
      for (const activityDoc of activitiesSnapshot.docs) {
        await deleteDoc(doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards/${cardId}/activities`, activityDoc.id));
      }

      await deleteDoc(doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards`, cardId));
      showUserMessage("Cartão excluído com sucesso!");
    } catch (e) {
      console.error("Erro ao excluir cartão: ", e);
      showUserMessage("Erro ao excluir cartão. Por favor, tente novamente.");
    }
  };

  // Drag and Drop Handlers for Cards
  const handleDragStartCard = (e, cardId, sourceListId) => {
    setDraggedCardId(cardId);
    setDraggedSourceListId(sourceListId);
    e.dataTransfer.setData('draggedCardId', cardId);
    e.dataTransfer.setData('draggedSourceListId', sourceListId);
    e.dataTransfer.setData('draggedCardContent', cards.find(c => c.id === cardId)?.content || 'Cartão'); // For visual feedback
  };

  const handleDragOverCard = (e) => {
    e.preventDefault(); // Allow drop
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropCard = async (e, targetCardId) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('draggedCardId');
    const sourceListId = e.dataTransfer.getData('draggedSourceListId');
    const targetListId = listId; // The list where it's dropped

    if (!draggedId) { // If no card is being dragged
      setDraggedCardId(null);
      setDraggedSourceListId(null);
      return;
    }
    if (draggedId === targetCardId && sourceListId === targetListId) { // If dropped on itself in the same list
      setDraggedCardId(null);
      setDraggedSourceListId(null);
      return;
    }

    // Get the dragged card's data from its original location
    const draggedCardRef = doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${sourceListId}/cards`, draggedId);
    const draggedCardSnap = await getDoc(draggedCardRef);

    if (!draggedCardSnap.exists()) {
        showUserMessage("Erro: O cartão arrastado não foi encontrado.");
        setDraggedCardId(null);
        setDraggedSourceListId(null);
        return;
    }
    const draggedCardData = draggedCardSnap.data();

    // Determine the new order for the dragged card
    let newOrder;
    const targetCard = cards.find(c => c.id === targetCardId);
    const targetIndex = cards.findIndex(c => c.id === targetCardId);

    if (targetCard) {
        // Dropped on an existing card
        if (targetIndex > 0) {
            const prevCard = cards[targetIndex - 1];
            newOrder = (prevCard.order + targetCard.order) / 2;
        } else {
            // Dropped at the beginning
            newOrder = targetCard.order / 2;
        }
    } else {
        // This case should be handled by handleDropOnEmptyList or if dropped at the very end of a non-empty list
        if (cards.length > 0) {
            newOrder = cards[cards.length - 1].order + 10;
        } else {
            newOrder = 10; // Fallback for empty list, though handleDropOnEmptyList should catch this
        }
    }

    const batch = writeBatch(db);

    // If moving between lists, delete from source and add to target
    if (sourceListId !== targetListId) {
        // Delete from source list
        batch.delete(draggedCardRef);

        // Add to target list with new order and updated listId
        const newCardDocRef = doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${targetListId}/cards`, draggedId);
        batch.set(newCardDocRef, {
            ...draggedCardData,
            listId: targetListId,
            order: newOrder,
            movedAt: new Date(),
            movedBy: userId,
            isArchived: false, // Ensure it's unarchived if moved from an archived state
        });

        // Move subcollections (comments and activities) by re-setting them
        const commentsSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${sourceListId}/cards/${draggedId}/comments`));
        for (const commentDoc of commentsSnapshot.docs) {
            batch.set(doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${targetListId}/cards/${draggedId}/comments`, commentDoc.id), commentDoc.data());
            batch.delete(doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${sourceListId}/cards/${draggedId}/comments`, commentDoc.id));
        }

        const activitiesSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${sourceListId}/cards/${draggedId}/activities`));
        for (const activityDoc of activitiesSnapshot.docs) {
            batch.set(doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${targetListId}/cards/${draggedId}/activities`, activityDoc.id), activityDoc.data());
            batch.delete(doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${sourceListId}/cards/${draggedId}/activities`, activityDoc.id));
        }

        // Add activity log for move
        batch.set(doc(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${targetListId}/cards/${draggedId}/activities`)), {
            type: 'card_moved',
            description: `Cartão movido de "${lists.find(l => l.id === sourceListId)?.name}" para "${lists.find(l => l.id === targetListId)?.name}".`,
            timestamp: serverTimestamp(),
            userId: userId,
        });

    } else {
        // Moving within the same list, just update order
        batch.update(draggedCardRef, { order: newOrder });
    }

    try {
        await batch.commit();
        if (selectedCard && selectedCard.id === draggedId) {
            setSelectedCard(null); // Close modal if the dragged card was open
        }
        showUserMessage("Cartão movido com sucesso!");
    } catch (error) {
        console.error("Erro ao mover cartão:", error);
        showUserMessage("Erro ao mover cartão. Por favor, tente novamente.");
    } finally {
        setDraggedCardId(null);
        setDraggedSourceListId(null);
    }
  };

  const handleDropOnEmptyList = async (e) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('draggedCardId');
    const sourceListId = e.dataTransfer.getData('draggedSourceListId');
    const targetListId = listId;

    if (!draggedId || sourceListId === targetListId) { // Prevent dropping on self or if not a valid drag
        return;
    }

    // Get the dragged card's data from its original location
    const draggedCardRef = doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${sourceListId}/cards`, draggedId);
    const draggedCardSnap = await getDoc(draggedCardRef);

    if (!draggedCardSnap.exists()) {
        showUserMessage("Erro: O cartão arrastado não foi encontrado.");
        return;
    }
    const draggedCardData = draggedCardSnap.data();

    const batch = writeBatch(db);

    // Delete from source list
    batch.delete(draggedCardRef);

    // Add to target list with new order (first card in empty list)
    const newCardDocRef = doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${targetListId}/cards`, draggedId);
    batch.set(newCardDocRef, {
        ...draggedCardData,
        listId: targetListId,
        order: 10, // First card in empty list
        movedAt: new Date(),
        movedBy: userId,
        isArchived: false, // Ensure it's unarchived if moved from an archived state
    });

    // Move subcollections (comments and activities) by re-setting them
    const commentsSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${sourceListId}/cards/${draggedId}/comments`));
    for (const commentDoc of commentsSnapshot.docs) {
        batch.set(doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${targetListId}/cards/${draggedId}/comments`, commentDoc.id), commentDoc.data());
        batch.delete(doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${sourceListId}/cards/${draggedId}/comments`, commentDoc.id));
    }

    const activitiesSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${sourceListId}/cards/${draggedId}/activities`));
    for (const activityDoc of activitiesSnapshot.docs) {
        batch.set(doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${targetListId}/cards/${draggedId}/activities`, activityDoc.id), activityDoc.data());
        batch.delete(doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${sourceListId}/cards/${draggedId}/activities`, activityDoc.id));
    }

    // Add activity log for move
    batch.set(doc(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${targetListId}/cards/${draggedId}/activities`)), {
        type: 'card_moved',
        description: `Cartão movido de "${lists.find(l => l.id === sourceListId)?.name}" para "${lists.find(l => l.id === targetListId)?.name}".`,
        timestamp: serverTimestamp(),
        userId: userId,
    });

    try {
        await batch.commit();
        if (selectedCard && selectedCard.id === draggedId) {
            setSelectedCard(null); // Close modal if the dragged card was open
        }
        showUserMessage("Cartão movido com sucesso!");
    } catch (error) {
        console.error("Erro ao mover cartão para lista vazia:", error);
        showUserMessage("Erro ao mover cartão para lista vazia. Por favor, tente novamente.");
    } finally {
        setDraggedCardId(null);
        setDraggedSourceListId(null);
    }
  };

  const handleOpenCardDetails = (card) => {
    setSelectedCard(card);
  };

  const handleCloseCardDetails = () => {
    setSelectedCard(null);
  };

  return (
    <div>
      {/* Adicionar Novo Cartão */}
      {!showArchivedCards && (
        <div className="mb-4 flex flex-col space-y-2">
          <input
            type="text"
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm placeholder-gray-500 text-gray-800"
            placeholder="Conteúdo do novo cartão"
            value={newCardContent}
            onChange={(e) => setNewCardContent(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCard()}
          />
          <button
            onClick={handleAddCard}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm text-sm transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
          >
            Adicionar Cartão
          </button>
        </div>
      )}

      {/* Exibição dos Cartões */}
      <div
        className="space-y-3 p-2 min-h-[50px]" // Added min-height for drop target
        onDragOver={handleDragOverCard}
        onDrop={handleDropOnEmptyList} // Handle drop on empty list area
      >
        {cards.length === 0 && <p className="text-gray-500 text-sm text-center py-2">Nenhum cartão nesta lista.{showArchivedCards && " (Nenhum cartão arquivado)"}</p>}
        {cards.map((card) => (
          <div
            key={card.id}
            className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-pointer transition duration-150
              ${draggedCardId === card.id ? 'opacity-50 border-dashed border-blue-500' : 'hover:bg-gray-50'}`}
            draggable="true"
            onDragStart={(e) => handleDragStartCard(e, card.id, listId)}
            onDragOver={handleDragOverCard}
            onDrop={(e) => handleDropCard(e, card.id)}
            onClick={() => handleOpenCardDetails(card)}
          >
            {card.coverImage && (
              <img src={card.coverImage} alt="Card Cover" className="w-full h-24 object-cover rounded-t-lg mb-2" onError={(e) => e.target.style.display='none'} />
            )}
            <p className="text-gray-700 text-sm mb-2 font-semibold">{card.content}</p>
            <div className="flex items-center space-x-2 text-xs text-gray-600 mb-1">
              {card.description && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L14.414 5a2 2 0 01.586 1.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 10a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0-3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0-3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {card.checklist && card.checklist.length > 0 && (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {card.checklist.filter(item => item.completed).length}/{card.checklist.length}
                </span>
              )}
            </div>
            {card.dueDate && (
              <p className={`text-xs mb-1 ${getDueDateClass(card.dueDate)}`}>
                Vencimento: {new Date(card.dueDate.toDate()).toLocaleDateString()}
              </p>
            )}
            {card.labels && card.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {card.labels.map((label, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {label}
                  </span>
                ))}
              </div>
            )}
            <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
              {card.assignedTo && (
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold mr-2">
                  {card.assignedTo.substring(0, 1).toUpperCase()}
                </div>
              )}
              <span>Criado por: {card.createdBy.substring(0, 6)}...</span>
              <button
                onClick={async (e) => {
                  e.stopPropagation(); // Evita abrir o modal ao clicar na lixeira
                  const confirmed = await confirmAction(`Tem certeza que deseja excluir o cartão "${card.content}"?`);
                  if (confirmed) {
                    handleDeleteCard(card.id);
                  }
                }}
                className="text-red-400 hover:text-red-600 transition duration-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
                title="Excluir Cartão"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 01-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          boardId={boardId}
          listId={listId}
          userId={userId}
          showUserMessage={showUserMessage}
          onClose={handleCloseCardDetails}
          appId={appId}
          db={db}
          confirmAction={confirmAction} // Pass confirmAction to CardDetailModal
        />
      )}
    </div>
  );
}

// src/components/CardDetailModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, addDoc, updateDoc, collection, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getDueDateClass } from '../utils';
import CardDetailsSection from './CardDetailsSection';
import ChecklistSection from './ChecklistSection';
import CommentsSection from './CommentsSection';
import ActivitySection from './ActivitySection';

function CardDetailModal({ card, boardId, listId, userId, showUserMessage, onClose, appId, db, confirmAction }) {
  const [editedContent, setEditedContent] = useState(card.content || '');
  const [editedDescription, setEditedDescription] = useState(card.description || '');
  const [editedDueDate, setEditedDueDate] = useState(card.dueDate ? card.dueDate.toDate().toISOString().split('T')[0] : '');
  const [editedLabels, setEditedLabels] = useState(card.labels ? card.labels.join(', ') : '');
  const [editedAssignedTo, setEditedAssignedTo] = useState(card.assignedTo || '');
  const [editedCoverImage, setEditedCoverImage] = useState(card.coverImage || '');
  const [checklistItems, setChecklistItems] = useState(card.checklist || []);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [activities, setActivities] = useState([]);
  const commentsEndRef = useRef(null);
  const activitiesEndRef = useRef(null);

  // Efeito para carregar comentários
  useEffect(() => {
    if (!card || !card.id) return;
    const commentsCollectionRef = collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards/${card.id}/comments`);
    const q = query(commentsCollectionRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(fetchedComments);
    }, (error) => {
      console.error("Erro ao carregar comentários:", error);
      showUserMessage("Erro ao carregar comentários. Por favor, tente novamente.");
    });
    return () => unsubscribe();
  }, [card.id, boardId, listId]);

  // Efeito para carregar atividades
  useEffect(() => {
    if (!card || !card.id) return;
    const activitiesCollectionRef = collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards/${card.id}/activities`);
    const q = query(activitiesCollectionRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedActivities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActivities(fetchedActivities);
    }, (error) => {
      console.error("Erro ao carregar atividades:", error);
      showUserMessage("Erro ao carregar atividades. Por favor, tente novamente.");
    });
    return () => unsubscribe();
  }, [card.id, boardId, listId]);

  // Rolar para o final dos comentários e atividades
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  useEffect(() => {
    activitiesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activities]);

  const handleSaveCardDetails = async () => {
    if (!userId) {
      showUserMessage("Utilizador não autenticado. Por favor, aguarde.");
      return;
    }

    try {
      const cardRef = doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards`, card.id);
      const cardDoc = await getDoc(cardRef);

      if (!cardDoc.exists()) {
        showUserMessage("Erro: O cartão não foi encontrado ou foi movido/excluído. A fechar os detalhes.");
        onClose();
        return;
      }

      const oldData = cardDoc.data();
      const updates = {};
      let activityDescription = [];

      if (editedContent !== oldData.content) {
        updates.content = editedContent;
        activityDescription.push(`conteúdo alterado de "${oldData.content}" para "${editedContent}"`);
      }
      if (editedDescription !== oldData.description) {
        updates.description = editedDescription;
        activityDescription.push(`descrição alterada`);
      }
      const newDueDate = editedDueDate ? new Date(editedDueDate) : null;
      if (newDueDate?.getTime() !== oldData.dueDate?.toDate().getTime()) {
        updates.dueDate = newDueDate;
        activityDescription.push(`data de vencimento alterada para ${editedDueDate || 'nenhuma'}`);
      }
      const newLabels = editedLabels.split(',').map(label => label.trim()).filter(label => label !== '');
      if (JSON.stringify(newLabels) !== JSON.stringify(oldData.labels)) {
        updates.labels = newLabels;
        activityDescription.push(`etiquetas alteradas para "${newLabels.join(', ')}"`);
      }
      if (editedAssignedTo !== oldData.assignedTo) {
        updates.assignedTo = editedAssignedTo;
        activityDescription.push(`atribuído a "${editedAssignedTo || 'ninguém'}"`);
      }
      if (editedCoverImage !== oldData.coverImage) {
        updates.coverImage = editedCoverImage;
        activityDescription.push(`capa do cartão alterada`);
      }
      if (JSON.stringify(checklistItems) !== JSON.stringify(oldData.checklist)) {
        updates.checklist = checklistItems;
        activityDescription.push(`checklist atualizada`);
      }


      if (Object.keys(updates).length > 0) {
        updates.lastEditedAt = new Date();
        updates.lastEditedBy = userId;
        await updateDoc(cardRef, updates);

        if (activityDescription.length > 0) {
          await addDoc(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards/${card.id}/activities`), {
            type: 'card_updated',
            description: `Cartão: ${activityDescription.join(', ')}.`,
            timestamp: serverTimestamp(),
            userId: userId,
          });
        }
      }

      showUserMessage("Detalhes do cartão atualizados com sucesso!");
      onClose();
    } catch (e) {
      console.error("Erro ao atualizar detalhes do cartão: ", e);
      showUserMessage("Erro ao atualizar detalhes do cartão. Por favor, tente novamente.");
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() === '') {
      showUserMessage("O comentário não pode estar vazio.");
      return;
    }
    if (!userId) {
      showUserMessage("Utilizador não autenticado. Por favor, aguarde.");
      return;
    }

    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards/${card.id}/comments`), {
        text: newComment,
        timestamp: serverTimestamp(),
        userId: userId,
      });
      setNewComment('');
      showUserMessage("Comentário adicionado!");
    } catch (e) {
      console.error("Erro ao adicionar comentário: ", e);
      showUserMessage("Erro ao adicionar comentário. Por favor, tente novamente.");
    }
  };

  const handleArchiveCard = async () => {
    if (!userId) {
      showUserMessage("Utilizador não autenticado. Por favor, aguarde.");
      return;
    }
    const confirmed = await confirmAction(`Tem certeza que deseja arquivar o cartão "${card.content}"?`);
    if (!confirmed) return;

    try {
      const cardRef = doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards`, card.id);
      await updateDoc(cardRef, {
        isArchived: true,
        archivedAt: new Date(),
        archivedBy: userId,
      });
      await addDoc(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards/${card.id}/activities`), {
        type: 'card_archived',
        description: `Cartão "${card.content}" arquivado.`,
        timestamp: serverTimestamp(),
        userId: userId,
      });
      showUserMessage("Cartão arquivado com sucesso!");
      onClose();
    } catch (e) {
      console.error("Erro ao arquivar cartão:", e);
      showUserMessage("Erro ao arquivar cartão. Por favor, tente novamente.");
    }
  };

  const handleRestoreCard = async () => {
    if (!userId) {
      showUserMessage("Utilizador não autenticado. Por favor, aguarde.");
      return;
    }
    const confirmed = await confirmAction(`Tem certeza que deseja restaurar o cartão "${card.content}"?`);
    if (!confirmed) return;

    try {
      const cardRef = doc(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards`, card.id);
      await updateDoc(cardRef, {
        isArchived: false,
        restoredAt: new Date(),
        restoredBy: userId,
      });
      await addDoc(collection(db, `artifacts/${appId}/public/data/boards/${boardId}/lists/${listId}/cards/${card.id}/activities`), {
        type: 'card_restored',
        description: `Cartão "${card.content}" restaurado.`,
        timestamp: serverTimestamp(),
        userId: userId,
      });
      showUserMessage("Cartão restaurado com sucesso!");
      onClose();
    } catch (e) {
      console.error("Erro ao restaurar cartão:", e);
      showUserMessage("Erro ao restaurar cartão. Por favor, tente novamente.");
    }
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim() === '') {
      showUserMessage("O item da checklist não pode estar vazio.");
      return;
    }
    setChecklistItems([...checklistItems, { text: newChecklistItem, completed: false, id: Date.now() }]);
    setNewChecklistItem('');
  };

  const handleToggleChecklistItem = (id) => {
    setChecklistItems(checklistItems.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleDeleteChecklistItem = (id) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id));
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-3xl w-full border border-gray-200 relative overflow-y-auto max-h-[90vh]">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Detalhes do Cartão</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Coluna Esquerda: Detalhes Editáveis */}
          <CardDetailsSection
            editedContent={editedContent}
            setEditedContent={setEditedContent}
            editedDescription={editedDescription}
            setEditedDescription={setEditedDescription}
            editedDueDate={editedDueDate}
            setEditedDueDate={setEditedDueDate}
            editedLabels={editedLabels}
            setEditedLabels={setEditedLabels}
            editedAssignedTo={editedAssignedTo}
            setEditedAssignedTo={setEditedAssignedTo}
            editedCoverImage={editedCoverImage}
            setEditedCoverImage={setEditedCoverImage}
            cardLastEditedAt={card.lastEditedAt}
            cardLastEditedBy={card.lastEditedBy}
          />

          {/* Coluna Direita: Checklist, Comentários e Atividade */}
          <div className="space-y-6">
            <ChecklistSection
              checklistItems={checklistItems}
              newChecklistItem={newChecklistItem}
              setNewChecklistItem={setNewChecklistItem}
              handleAddChecklistItem={handleAddChecklistItem}
              handleToggleChecklistItem={handleToggleChecklistItem}
              handleDeleteChecklistItem={handleDeleteChecklistItem}
            />

            <CommentsSection
              comments={comments}
              newComment={newComment}
              setNewComment={setNewComment}
              handleAddComment={handleAddComment}
              commentsEndRef={commentsEndRef}
            />

            <ActivitySection
              activities={activities}
              activitiesEndRef={activitiesEndRef}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 border-t pt-6 mt-6">
          {card.isArchived ? (
            <button
              onClick={handleRestoreCard}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
            >
              Restaurar Cartão
            </button>
          ) : (
            <button
              onClick={handleArchiveCard}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75"
            >
              Arquivar Cartão
            </button>
          )}
          <button
            onClick={handleSaveCardDetails}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            Guardar
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CardDetailModal;


// src/components/ConfirmationModal.jsx
import React from 'react';

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center border border-gray-200">
        <p className="text-lg font-semibold text-gray-800 mb-6">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
          >
            Confirmar
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-5 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;


// src/components/CardDetailsSection.jsx
import React from 'react';

function CardDetailsSection({
  editedContent, setEditedContent,
  editedDescription, setEditedDescription,
  editedDueDate, setEditedDueDate,
  editedLabels, setEditedLabels,
  editedAssignedTo, setEditedAssignedTo,
  editedCoverImage, setEditedCoverImage,
  cardLastEditedAt, cardLastEditedBy
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-700 text-sm font-semibold mb-2">Conteúdo do Cartão:</label>
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-semibold mb-2">Descrição:</label>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 h-24 resize-y"
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          placeholder="Adicione uma descrição detalhada..."
        ></textarea>
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-semibold mb-2">Data de Vencimento:</label>
        <input
          type="date"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          value={editedDueDate}
          onChange={(e) => setEditedDueDate(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-semibold mb-2">Etiquetas (separadas por vírgula):</label>
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          value={editedLabels}
          onChange={(e) => setEditedLabels(e.target.value)}
          placeholder="Ex: Urgente, Bug, Feature"
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-semibold mb-2">Atribuído a (ID do Utilizador):</label>
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          value={editedAssignedTo}
          onChange={(e) => setEditedAssignedTo(e.target.value)}
          placeholder="ID do utilizador (ex: abcd12...)"
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-semibold mb-2">Capa do Cartão (URL da Imagem):</label>
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          value={editedCoverImage}
          onChange={(e) => setEditedCoverImage(e.target.value)}
          placeholder="https://exemplo.com/imagem.jpg"
        />
      </div>
      {cardLastEditedAt && (
          <p className="text-xs text-gray-500">Última edição: {new Date(cardLastEditedAt.toDate()).toLocaleString()} por {cardLastEditedBy.substring(0, 6)}...</p>
      )}
    </div>
  );
}

export default CardDetailsSection;


// src/components/ChecklistSection.jsx
import React from 'react';

function ChecklistSection({
  checklistItems, newChecklistItem, setNewChecklistItem,
  handleAddChecklistItem, handleToggleChecklistItem, handleDeleteChecklistItem
}) {
  return (
    <div>
      <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Checklist ({checklistItems.filter(item => item.completed).length}/{checklistItems.length})
      </h4>
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 h-40 overflow-y-auto custom-scrollbar mb-3">
        {checklistItems.length === 0 && <p className="text-gray-500 text-sm text-center py-2">Nenhum item na checklist.</p>}
        {checklistItems.map((item) => (
          <div key={item.id} className="flex items-center mb-2 p-2 bg-white rounded-md shadow-sm border border-gray-100">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => handleToggleChecklistItem(item.id)}
              className="form-checkbox h-4 w-4 text-blue-600 rounded mr-2"
            />
            <span className={`flex-grow text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
              {item.text}
            </span>
            <button
              onClick={() => handleDeleteChecklistItem(item.id)}
              className="ml-2 text-red-400 hover:text-red-600 transition duration-200"
              title="Remover item da checklist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm placeholder-gray-500 text-gray-800"
          placeholder="Adicionar item da checklist..."
          value={newChecklistItem}
          onChange={(e) => setNewChecklistItem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
        />
        <button
          onClick={handleAddChecklistItem}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg shadow-sm transition duration-300 ease-in-out transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ChecklistSection;


// src/components/CommentsSection.jsx
import React from 'react';

function CommentsSection({ comments, newComment, setNewComment, handleAddComment, commentsEndRef }) {
  return (
    <div>
      <h4 className="text-lg font-bold text-gray-800 mb-3">Comentários</h4>
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 h-40 overflow-y-auto custom-scrollbar mb-3">
        {comments.length === 0 && <p className="text-gray-500 text-sm text-center py-2">Nenhum comentário ainda.</p>}
        {comments.map((comment) => (
          <div key={comment.id} className="mb-2 p-2 bg-white rounded-md shadow-sm border border-gray-100">
            <p className="text-sm text-gray-700">{comment.text}</p>
            <span className="block text-right text-xs text-gray-500 mt-1">
              {comment.userId.substring(0, 6)}... em {comment.timestamp ? new Date(comment.timestamp.toDate()).toLocaleString() : 'A enviar...'}
            </span>
          </div>
        ))}
        <div ref={commentsEndRef} />
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm placeholder-gray-500 text-gray-800"
          placeholder="Adicionar um comentário..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
        />
        <button
          onClick={handleAddComment}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg shadow-sm transition duration-300 ease-in-out transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default CommentsSection;


// src/components/ActivitySection.jsx
import React from 'react';

function ActivitySection({ activities, activitiesEndRef }) {
  return (
    <div>
      <h4 className="text-lg font-bold text-gray-800 mb-3">Atividade</h4>
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 h-40 overflow-y-auto custom-scrollbar">
        {activities.length === 0 && <p className="text-gray-500 text-sm text-center py-2">Nenhuma atividade registada.</p>}
        {activities.map((activity) => (
          <div key={activity.id} className="mb-2 p-2 bg-white rounded-md shadow-sm border border-gray-100">
            <p className="text-sm text-gray-700">{activity.description}</p>
            <span className="block text-right text-xs text-gray-500 mt-1">
              {activity.userId.substring(0, 6)}... em {activity.timestamp ? new Date(activity.timestamp.toDate()).toLocaleString() : 'A registar...'}
            </span>
          </div>
        ))}
        <div ref={activitiesEndRef} />
      </div>
    </div>
  );
}

export default ActivitySection;


// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };


// src/constants.js
export const BOARD_BACKGROUNDS = [
  '#0079BF', // Trello Blue
  '#519839', // Trello Green
  '#B04632', // Trello Red
  '#89609E', // Trello Purple
  '#CD5A91', // Trello Pink
  '#4BBF6B', // Light Green
  '#00AECC', // Cyan
];


// src/utils.js
export const getDueDateClass = (dueDate) => {
  if (!dueDate) return '';
  const now = new Date();
  const due = dueDate.toDate();
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'text-red-600 font-bold'; // Overdue
  if (diffDays <= 2) return 'text-orange-500 font-semibold'; // Due soon
  return 'text-gray-600';
};
