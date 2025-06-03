// Cores de fundo predefinidas para o quadro
const BOARD_BACKGROUNDS = [
  '#0079BF', // Trello Blue
  '#519839', // Trello Green
  '#B04632', // Trello Red
  '#89609E', // Trello Purple
  '#CD5A91', // Trello Pink
  '#4BBF6B', // Light Green
  '#00AECC', // Cyan
];

// Função utilitária para classes de data de vencimento
const getDueDateClass = (dueDate) => {
  if (!dueDate) return '';
  const now = new Date();
  const due = dueDate.toDate();
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'text-red-600 font-bold'; // Overdue
  if (diffDays <= 2) return 'text-orange-500 font-semibold'; // Due soon
  return 'text-gray-600';
};

// Componente para o Modal de Confirmação
function ConfirmationModal({ message, onConfirm, onCancel }) {
  // Acessa React diretamente do escopo global
  const { useState, useEffect, useRef } = React;
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

// Componente para a Secção de Detalhes do Cartão
function CardDetailsSection({
  editedContent, setEditedContent,
  editedDescription, setEditedDescription,
  editedDueDate, setEditedDueDate,
  editedLabels, setEditedLabels,
  editedAssignedTo, setEditedAssignedTo,
  editedCoverImage, setEditedCoverImage,
  cardLastEditedAt, cardLastEditedBy
}) {
  const { useState, useEffect, useRef } = React; // Acessa React diretamente
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

// Componente para a Secção de Checklist
function ChecklistSection({
  checklistItems, newChecklistItem, setNewChecklistItem,
  handleAddChecklistItem, handleToggleChecklistItem, handleDeleteChecklistItem
}) {
  const { useState, useEffect, useRef } = React; // Acessa React diretamente
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

// Componente para a Secção de Comentários
function CommentsSection({ comments, newComment, setNewComment, handleAddComment, commentsEndRef }) {
  const { useState, useEffect, useRef } = React; // Acessa React diretamente
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

// Componente para a Secção de Atividade
function ActivitySection({ activities, activitiesEndRef }) {
  const { useState, useEffect, useRef } = React; // Acessa React diretamente
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


// Componente Modal de Detalhes do Cartão
function CardDetailModal({ card, boardId, listId, userId, showUserMessage, onClose, appId, db, confirmAction }) {
  const { useState, useEffect, useRef } = React; // Acessa React diretamente
  // Acessa as funções do Firestore do objeto global
  const { doc, getDoc, addDoc, updateDoc, collection, query, orderBy, onSnapshot, serverTimestamp } = window.firebaseFirestoreFunctions;
  
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