// Importações do React e ReactDOM via esm.sh para consistência de versão
const React = await import('https://esm.sh/react@18.2.0');
const { useState, useEffect, useCallback, useRef } = React; 
// Para React 18, usamos createRoot de react-dom/client
const ReactDOMClient = await import('https://esm.sh/react-dom@18.2.0/client');
const { DragDropContext, Droppable, Draggable } = await import('https://esm.sh/react-beautiful-dnd@13.1.1?deps=react@18.2.0');


// Elementos do DOM
const loginFormEl = document.getElementById('loginForm');
const loginContainerEl = document.getElementById('loginContainer');
const appRootEl = document.getElementById('app-root'); // Ponto de montagem único
const errorMessageDivEl = document.getElementById('errorMessage'); // Para o login form
const notificationRootEl = document.getElementById('notificationAreaRoot');


let reactAppRoot = null; 
let notificationReactAppRoot = null;

// Dados Iniciais Simulados
const initialBoardData = {
    title: "Projeto Construção Residencial Z",
    lists: { 
        "list-1": { id: "list-1", title: "Tarefas Pendentes (Backlog)", cardIds: ["card-1", "card-2", "card-7"]},
        "list-2": { id: "list-2", title: "Em Andamento", cardIds: ["card-3", "card-4"]},
        "list-3": { id: "list-3", title: "Revisão Técnica", cardIds: ["card-5"]},
        "list-4": { id: "list-4", title: "Concluído", cardIds: ["card-6"]}
    },
    cards: { 
        "card-1": { id: "card-1", text: "Levantamento topográfico do terreno e sondagem", profile: "Engenharia", color: null, location: { lat: -22.9083, lng: -43.1964 }, mapFeatures: [], productivityNotes: [], associatedMaterials: [] }, 
        "card-2": { id: "card-2", text: "Aprovação do projeto arquitetônico na prefeitura e órgãos competentes", profile: "Global", color: null, mapFeatures: [], productivityNotes: [], associatedMaterials: [] },
        "card-3": { id: "card-3", text: "Escavação e preparo da fundação (incluindo formas e ferragens)", profile: "Obra", color: null, location: { lat: -22.9028, lng: -43.2075 }, mapFeatures: [], productivityNotes: [], associatedMaterials: [] }, 
        "card-4": { id: "card-4", text: "Compra de materiais estruturais (aço, cimento, areia, brita)", profile: "Compras", color: null, mapFeatures: [], productivityNotes: [], associatedMaterials: [] },
        "card-5": { id: "card-5", text: "Inspeção da concretagem da laje do primeiro pavimento", profile: "Engenharia", color: null, mapFeatures: [], productivityNotes: [], associatedMaterials: [] },
        "card-6": { id: "card-6", text: "Relatório fotográfico e de progresso da semana 1 (01/06 - 07/06)", profile: "Global", color: "#60bd4e", mapFeatures: [], productivityNotes: [], associatedMaterials: [] }, 
        "card-7": { id: "card-7", text: "Contratação e integração da equipe de alvenaria", profile: "RH", color: null, location: { lat: -22.9139, lng: -43.1794 }, mapFeatures: [], productivityNotes: [], associatedMaterials: [] }, 
    },
    listOrder: ["list-1", "list-2", "list-3", "list-4"], 
    profiles: ["Global", "Engenharia", "Obra", "Compras", "RH", "Financeiro", "Cliente"],
    labelColors: [
        { id: 'color-1', name: 'Padrão', hex: '#60bd4e' }, 
        { id: 'color-2', name: 'Urgente', hex: '#eb5a46' }, 
        { id: 'color-3', name: 'Atenção', hex: '#f2d600' }, 
        { id: 'color-4', name: 'Info', hex: '#0079bf' },    
        { id: 'color-5', name: 'Revisão Cliente', hex: '#ff9f1a' } 
    ],
    users: [ 
        { id: 'user-admin', username: 'admin', profile: 'Global' }, 
        { id: 'user-eng', username: 'engenheiro01', profile: 'Engenharia' },
        { id: 'user-obra', username: 'mestredeobras', profile: 'Obra' },
    ],
    drawingTypes: [
        { value: "meio_fio", label: "Linha - Meio Fio", shape: "polyline", defaultColor: "#808080" },
        { value: "drenagem_400", label: "Linha - Drenagem Ø400mm", shape: "polyline", defaultColor: "#0000FF" },
        { value: "drenagem_600", label: "Linha - Drenagem Ø600mm", shape: "polyline", defaultColor: "#0000AA" },
        { value: "drenagem_800", label: "Linha - Drenagem Ø800mm", shape: "polyline", defaultColor: "#000077" },
        { value: "muro", label: "Linha - Muro", shape: "polyline", defaultColor: "#A52A2A" },
        { value: "boca_lobo", label: "Marcador - Boca de Lobo", shape: "marker", defaultColor: "#FFA500" },
        { value: "poste", label: "Marcador - Poste", shape: "marker", defaultColor: "#FFD700" },
        { value: "area_construcao", label: "Polígono - Área de Construção", shape: "polygon", defaultColor: "#FFC0CB" },
        { value: "outro_linha", label: "Linha - Outro", shape: "polyline", defaultColor: "#000000" },
        { value: "outro_marcador", label: "Marcador - Outro", shape: "marker", defaultColor: "#000000" },
        { value: "outro_poligono", label: "Polígono - Outro", shape: "polygon", defaultColor: "#000000" },
    ],
    messages: [ 
        {id: `msg-${Date.now()}`, text: "Bem-vindos ao Construboard! Todas as atualizações importantes serão postadas aqui.", targetProfile: "Global", sender: "admin", timestamp: Date.now() - 100000},
        {id: `msg-${Date.now()+1}`, text: "Engenheiros, favor revisar os cálculos estruturais do Bloco C até sexta-feira.", targetProfile: "Engenharia", sender: "admin", timestamp: Date.now() - 50000},
    ]
};

// --- Componentes React ---
// (Card, Modal, AddItemForm, List, BoardDisplay, AdminPanel, MapPanel, AssociateDrawingForm, MarkingsListPanel - Definições como na versão anterior)
// COPIE E COLE AS DEFINIÇÕES DOS COMPONENTES REACT DA VERSÃO ANTERIOR AQUI.
// Certifique-se de que eles estão definidos ANTES do TrelloCloneAppLayout.

function Card({ card, index }) {
    const colorIndicator = card.color ? 
        React.createElement('div', { 
            className: 'card-color-indicator', 
            style: { backgroundColor: card.color } 
        }) : null;

    return React.createElement(Draggable, { draggableId: card.id, index: index },
        (provided, snapshot) => React.createElement('div', {
            className: `card ${snapshot.isDragging ? 'card-dragging' : ''}`,
            ref: provided.innerRef,
            ...provided.draggableProps,
            ...provided.dragHandleProps, 
            onClick: () => console.log("Card clicked (placeholder para editar):", card.id) 
        }, 
          colorIndicator, 
          React.createElement('span', { style: { marginLeft: card.color ? '10px' : '0' } }, card.text), 
          card.profile && card.profile !== "Global" && React.createElement('div', {
              style: { fontSize: '0.8em', color: '#5e6c84', marginTop: '5px', borderTop: '1px dashed #ccc', paddingTop: '3px', marginLeft: card.color ? '10px' : '0'}
          }, `Perfil: ${card.profile}`)
        )
    );
}

function Modal({ isOpen, onClose, title, children, size = 'medium' }) { 
    if (!isOpen) return null;
    let modalMaxWidth = '500px';
    if (size === 'large') modalMaxWidth = '800px';
    if (size === 'small') modalMaxWidth = '350px';

    return React.createElement('div', { className: 'modal-backdrop', onClick: onClose },
        React.createElement('div', { 
            className: 'modal-content', 
            onClick: e => e.stopPropagation(),
            style: { maxWidth: modalMaxWidth } 
        }, 
            React.createElement('h3', null, title),
            children
        )
    );
}


function AddItemForm({ placeholder, buttonText, onSubmit, onCancel, isCardForm = true, children, initialText = '' }) {
    const [text, setText] = useState(initialText); 

    useEffect(() => { 
        setText(initialText);
    }, [initialText]);

    const internalSubmit = (e) => {
        e.preventDefault();
        if (children) { 
            onSubmit(); 
        } else if (text.trim()){ 
            onSubmit(text.trim());
            if (!initialText) setText(''); 
        }
    };
    
    const handleBlur = (e) => {
        setTimeout(() => {
            if (e.currentTarget && !e.currentTarget.contains(document.activeElement) && !text.trim() && !children && !initialText) {
                 if (document.activeElement !== e.currentTarget.querySelector('button[type="submit"]')) {
                    onCancel && onCancel();
                }
            }
        }, 0);
    };

    return React.createElement('form', { className: 'add-item-form', onSubmit: internalSubmit, onBlur: children ? null : handleBlur },
        !children && (isCardForm ?
        React.createElement('textarea', {
            value: text,
            onChange: (e) => setText(e.target.value),
            placeholder: placeholder,
            autoFocus: true, 
            rows: 3 
        }) : 
        React.createElement('input', {
            type: 'text',
            value: text,
            onChange: (e) => setText(e.target.value),
            placeholder: placeholder,
            autoFocus: true
        })),
        children, 
        React.createElement('div', { className: 'add-item-actions' },
            React.createElement('button', { type: 'submit', className: 'btn btn-success btn-sm' }, buttonText),
            onCancel && React.createElement('button', { type: 'button', className: 'close-form-btn', onClick: onCancel, title: "Cancelar" }, '×')
        )
    );
}


function List({ list, cards, index, onAddCard }) { 
    const [showAddCardForm, setShowAddCardForm] = useState(false);

    const handleAddCardSubmit = (cardText) => { 
        onAddCard(list.id, { text: cardText, profile: "Global", color: null, mapFeatures: [], productivityNotes: [], associatedMaterials: [] }); 
        setShowAddCardForm(false); 
    };

    return React.createElement(Draggable, { draggableId: list.id, index: index, isDragDisabled: true }, 
        (providedDraggableList) => React.createElement('div', {
                className: 'list-wrapper', 
                ref: providedDraggableList.innerRef,
                ...providedDraggableList.draggableProps
            },
            React.createElement('div', { className: 'list' },
                React.createElement('div', { className: 'list-header', ...providedDraggableList.dragHandleProps }, 
                    React.createElement('h3', { className: 'list-title' }, list.title)
                ),
                React.createElement(Droppable, { droppableId: list.id, type: 'card' }, 
                    (providedDroppableCards, snapshot) => React.createElement('div', { 
                        className: 'list-cards',
                        ref: providedDroppableCards.innerRef, 
                        ...providedDroppableCards.droppableProps,
                    },
                        cards.map((card, idx) => React.createElement(Card, { key: card.id, card: card, index: idx })),
                        providedDroppableCards.placeholder 
                    )
                ),
                React.createElement('div', { className: 'add-item-controls' },
                    showAddCardForm ?
                    React.createElement(AddItemForm, {
                        placeholder: "Insira um título para este cartão...",
                        buttonText: "Adicionar Cartão",
                        onSubmit: handleAddCardSubmit,
                        onCancel: () => setShowAddCardForm(false),
                        isCardForm: true
                    }) :
                    React.createElement('button', {
                        className: 'btn btn-subtle btn-sm', 
                        onClick: () => setShowAddCardForm(true)
                    }, '+ Adicionar um cartão')
                )
            )
        )
    );
}


function BoardDisplay({ boardData, onAddList, onAddCardToList, onDragEndUpdate, currentUserProfile, isAdmin }) { 
    const [showAddListForm, setShowAddListForm] = useState(false);

    const handleAddListSubmit = (listTitle) => {
        onAddList(listTitle);
        setShowAddListForm(false);
    };
    
    const getVisibleCardsForList = (list) => {
        if (!list || !list.cardIds) return [];
        return list.cardIds.map(cardId => boardData.cards[cardId]).filter(card => {
            if (!card) return false;
            if (isAdmin || card.profile === "Global" || card.profile === currentUserProfile) {
                return true;
            }
            return false;
        }).filter(Boolean); 
    };

    return React.createElement(DragDropContext, { onDragEnd: onDragEndUpdate }, 
        React.createElement(Droppable, { droppableId: 'all-lists', direction: 'horizontal', type: 'list', isDropDisabled: true }, 
            (providedDroppableBoard) => React.createElement('div', { 
                    className: 'board-canvas', 
                    ref: providedDroppableBoard.innerRef, 
                    ...providedDroppableBoard.droppableProps 
                },
                React.createElement('div', {className: 'board'},
                    boardData.listOrder.map((listId, index) => {
                        const list = boardData.lists[listId];
                        if (!list) return null; 
                        const visibleCards = getVisibleCardsForList(list);
                        
                        return React.createElement(List, {
                            key: list.id,
                            list: list,
                            cards: visibleCards, 
                            index: index, 
                            onAddCard: onAddCardToList
                        });
                    }),
                    providedDroppableBoard.placeholder, 
                    isAdmin && React.createElement('div', { className: 'add-list-button-wrapper' }, 
                        showAddListForm ?
                        React.createElement(AddItemForm, {
                            placeholder: "Insira o título da lista...",
                            buttonText: "Adicionar Lista",
                            onSubmit: handleAddListSubmit,
                            onCancel: () => setShowAddListForm(false),
                            isCardForm: false
                        }) :
                        React.createElement('button', {
                            className: 'btn btn-subtle',
                            onClick: () => setShowAddListForm(true)
                        }, '+ Adicionar outra lista')
                    )
                )
            )
        )
    );
}

function AdminPanel({ boardData, onAdminCreateCard, onAdminUpdateCard, onAdminAddProfile, onAdminDeleteProfile, onAdminUpdateProfile, onAdminAddLabelColor, onAdminDeleteLabelColor, onAdminUpdateLabelColor, onAdminCreateUser, onAdminDeleteUser, onAdminUpdateUser }) {
    const [editingItem, setEditingItem] = useState(null); 
    const [adminNewCardText, setAdminNewCardText] = useState('');
    const [adminNewCardListId, setAdminNewCardListId] = useState(boardData.listOrder.length > 0 ? boardData.listOrder[0] : '');
    const [adminNewCardProfile, setAdminNewCardProfile] = useState('Global');
    const [adminNewCardColorHex, setAdminNewCardColorHex] = useState('');
    const [profileName, setProfileName] = useState('');
    const [colorName, setColorName] = useState('');
    const [colorHexValue, setColorHexValue] = useState('#4caf50');
    const [userName, setUserName] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [userConfirmPassword, setUserConfirmPassword] = useState('');
    const [userProfile, setUserProfile] = useState('Global');
    const [editingCardText, setEditingCardText] = useState('');
    const [editingCardProfile, setEditingCardProfile] = useState('Global');
    const [editingCardColor, setEditingCardColor] = useState('');
    const [editingCardListId, setEditingCardListId] = useState('');

    const resetAllForms = () => { 
        setAdminNewCardText(''); setAdminNewCardListId(boardData.listOrder.length > 0 ? boardData.listOrder[0] : ''); setAdminNewCardProfile('Global'); setAdminNewCardColorHex('');
        setProfileName(''); 
        setColorName(''); setColorHexValue('#4caf50');
        setUserName(''); setUserPassword(''); setUserConfirmPassword(''); setUserProfile('Global');
    };
    
    const resetEditingModalStates = () => {
        setEditingCardText(''); setEditingCardProfile('Global'); setEditingCardColor(''); setEditingCardListId('');
        setProfileName(''); 
        setColorName(''); setColorHexValue('#4caf50'); 
        setUserName(''); setUserProfile('Global'); 
    };


    const openEditModal = (type, item) => {
        resetEditingModalStates(); 
        setEditingItem({ type, data: item });
        if (type === 'profile') setProfileName(item); 
        if (type === 'color') { setColorName(item.name); setColorHexValue(item.hex); }
        if (type === 'user') { setUserName(item.username); setUserProfile(item.profile); }
        if (type === 'card') { 
            setEditingCardText(item.text); 
            setEditingCardProfile(item.profile); 
            setEditingCardColor(item.color || '');
            let currentListId = '';
            for (const listId of boardData.listOrder) {
                if (boardData.lists[listId] && boardData.lists[listId].cardIds.includes(item.id)) {
                    currentListId = listId;
                    break;
                }
            }
            setEditingCardListId(currentListId || (boardData.listOrder.length > 0 ? boardData.listOrder[0] : ''));
        }
    };
    const closeEditModal = () => {
        setEditingItem(null);
        resetEditingModalStates(); 
    };

    const handleAdminCreateCardSubmit = () => {
        if (adminNewCardText.trim() && adminNewCardListId) {
            onAdminCreateCard({
                text: adminNewCardText.trim(),
                listId: adminNewCardListId,
                profile: adminNewCardProfile,
                color: adminNewCardColorHex || null
            });
            setAdminNewCardText(''); setAdminNewCardProfile('Global'); setAdminNewCardColorHex(''); 
        } else {
            alert("Por favor, preencha o texto do cartão e selecione uma lista.");
        }
    };
    const handleAddProfileSubmit = (e) => {
        e.preventDefault();
        if (profileName.trim()) { 
            onAdminAddProfile(profileName.trim());
            setProfileName(''); 
        } else {
            alert("Por favor, insira um nome para o perfil.");
        }
    };

    const handleAddColorSubmit = (e) => {
        e.preventDefault();
        if (colorName.trim() && colorHexValue) { 
            onAdminAddLabelColor({ name: colorName.trim(), hex: colorHexValue });
            setColorName(''); setColorHexValue('#4caf50'); 
        } else {
            alert("Por favor, preencha o nome e a cor da etiqueta.");
        }
    };
    
    const handleCreateUserSubmit = (e) => {
        e.preventDefault();
        if (userPassword !== userConfirmPassword) {
            alert("As senhas não coincidem!");
            return;
        }
        if (userName.trim() && userPassword.trim()) { 
            onAdminCreateUser({
                username: userName.trim(),
                password: userPassword, 
                profile: userProfile
            });
            setUserName(''); setUserPassword(''); setUserConfirmPassword(''); setUserProfile('Global'); 
        } else {
             alert("Por favor, preencha nome de usuário e senha.");
        }
    };
    
    const handleEditProfileSubmit = () => {
        if (profileName.trim() && editingItem && editingItem.type === 'profile') {
            onAdminUpdateProfile(editingItem.data, profileName.trim()); 
            closeEditModal();
        }
    };
    const handleEditColorSubmit = () => {
         if (colorName.trim() && colorHexValue && editingItem && editingItem.type === 'color') {
            onAdminUpdateLabelColor(editingItem.data.id, { name: colorName.trim(), hex: colorHexValue });
            closeEditModal();
        }
    };
    const handleEditUserSubmit = () => {
         if (userName.trim() && editingItem && editingItem.type === 'user') {
            onAdminUpdateUser(editingItem.data.id, { username: userName.trim(), profile: userProfile });
            closeEditModal();
        }
    };
     const handleEditCardSubmit = () => {
        if (editingCardText.trim() && editingItem && editingItem.type === 'card') {
            onAdminUpdateCard(editingItem.data.id, {
                text: editingCardText.trim(),
                profile: editingCardProfile,
                color: editingCardColor || null,
            }, editingCardListId); 
            closeEditModal();
        }
    };


    return React.createElement('div', { className: 'admin-panel-content' }, 
        React.createElement('h2', null, 'Painel de Administração'),
        
        editingItem && React.createElement(Modal, { isOpen: !!editingItem, onClose: closeEditModal, title: `Editar ${editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1)}` },
            editingItem.type === 'profile' && React.createElement(AddItemForm, {
                buttonText: "Salvar Perfil", onSubmit: handleEditProfileSubmit, onCancel: closeEditModal, isCardForm: false, initialText: profileName 
            }, React.createElement('div', {className: 'input-group'},
                   React.createElement('label', {htmlFor: 'editProfileNameModal'}, 'Nome do Perfil:'),
                   React.createElement('input', {type: 'text', id: 'editProfileNameModal', value: profileName, onChange: e => setProfileName(e.target.value), required: true })
               )
            ),
            editingItem.type === 'color' && React.createElement(AddItemForm, {
                buttonText: "Salvar Cor", onSubmit: handleEditColorSubmit, onCancel: closeEditModal, isCardForm: false
            }, React.createElement(React.Fragment, null,
                   React.createElement('div', {className: 'input-group'},
                       React.createElement('label', {htmlFor: 'editColorNameModal'}, 'Nome da Cor:'),
                       React.createElement('input', {type: 'text', id: 'editColorNameModal', value: colorName, onChange: e => setColorName(e.target.value), required: true })
                   ),
                   React.createElement('div', {className: 'input-group color-picker-wrapper'},
                       React.createElement('label', {htmlFor: 'editColorHexModal'}, 'Cor:'),
                       React.createElement('input', {type: 'color', id: 'editColorHexModal', value: colorHexValue, onChange: e => setColorHexValue(e.target.value)}),
                       React.createElement('span', null, colorHexValue)
                   )
               )
            ),
            editingItem.type === 'user' && React.createElement(AddItemForm, {
                buttonText: "Salvar Usuário", onSubmit: handleEditUserSubmit, onCancel: closeEditModal, isCardForm: false
            }, React.createElement(React.Fragment, null,
                   React.createElement('div', {className: 'input-group'},
                       React.createElement('label', {htmlFor: 'editUserNameModal'}, 'Nome de Usuário:'),
                       React.createElement('input', {type: 'text', id: 'editUserNameModal', value: userName, onChange: e => setUserName(e.target.value), required: true })
                   ),
                   React.createElement('div', {className: 'input-group'},
                       React.createElement('label', {htmlFor: 'editUserProfileModal'}, 'Perfil:'),
                       React.createElement('select', {id: 'editUserProfileModal', value: userProfile, onChange: e => setUserProfile(e.target.value)},
                           boardData.profiles.map(p => React.createElement('option', {key: p, value: p}, p))
                       )
                   ),
                   React.createElement('p', {style:{fontSize:'0.9em', color: '#5e6c84'}}, '(A alteração de senha deve ser feita por um processo de redefinição)')
               )
            ),
            editingItem.type === 'card' && React.createElement(AddItemForm, {
                buttonText: "Salvar Cartão", onSubmit: handleEditCardSubmit, onCancel: closeEditModal, isCardForm: false
            }, React.createElement(React.Fragment, null,
                    React.createElement('div', {className: 'input-group'},
                        React.createElement('label', {htmlFor: 'editCardTextModal'}, 'Texto do Cartão:'),
                        React.createElement('textarea', {id: 'editCardTextModal', value: editingCardText, onChange: e => setEditingCardText(e.target.value), required: true, rows: 3})
                    ),
                    React.createElement('div', {className: 'input-group'},
                        React.createElement('label', {htmlFor: 'editCardListModal'}, 'Lista:'),
                        React.createElement('select', {id: 'editCardListModal', value: editingCardListId, onChange: e => setEditingCardListId(e.target.value)},
                            boardData.listOrder.map(listId => React.createElement('option', {key:listId, value:listId}, boardData.lists[listId].title))
                        )
                    ),
                    React.createElement('div', {className: 'input-group'},
                        React.createElement('label', {htmlFor: 'editCardProfileModal'}, 'Perfil:'),
                        React.createElement('select', {id: 'editCardProfileModal', value: editingCardProfile, onChange: e => setEditingCardProfile(e.target.value)},
                            boardData.profiles.map(p => React.createElement('option', {key: p, value: p}, p))
                        )
                    ),
                    React.createElement('div', {className: 'input-group'},
                        React.createElement('label', {htmlFor: 'editCardColorModal'}, 'Cor:'),
                        React.createElement('select', {id: 'editCardColorModal', value: editingCardColor, onChange: e => setEditingCardColor(e.target.value)},
                            React.createElement('option', {value: ''}, 'Nenhuma'),
                            boardData.labelColors.map(c => React.createElement('option', {key: c.id, value: c.hex, style:{backgroundColor: c.hex, color: c.hex === '#f2d600' || c.hex === '#ffffff' ? '#000' : '#fff'}}, c.name))
                        )
                    )
                )
            )
        ),


        // Seção: Gerenciar Usuários
        React.createElement('div', { className: 'admin-section' },
            React.createElement('h3', null, 'Gerenciar Usuários'),
            React.createElement('form', { onSubmit: handleCreateUserSubmit, className: 'add-item-form' },
                React.createElement('div', { className: 'form-grid' },
                    React.createElement('div', {className: 'input-group'},
                        React.createElement('label', {htmlFor: 'adminNewUsername'}, 'Nome de Usuário:'),
                        React.createElement('input', {type: 'text', id: 'adminNewUsername', value: userName, onChange: e => setUserName(e.target.value), required: true, placeholder: "novo_usuario" })
                    ),
                    React.createElement('div', {className: 'input-group'},
                        React.createElement('label', {htmlFor: 'adminNewUserPassword'}, 'Senha:'),
                        React.createElement('input', {type: 'password', id: 'adminNewUserPassword', value: userPassword, onChange: e => setUserPassword(e.target.value), required: true, placeholder: "********" })
                    ),
                     React.createElement('div', {className: 'input-group'},
                        React.createElement('label', {htmlFor: 'adminConfirmUserPassword'}, 'Confirmar Senha:'),
                        React.createElement('input', {type: 'password', id: 'adminConfirmUserPassword', value: userConfirmPassword, onChange: e => setUserConfirmPassword(e.target.value), required: true, placeholder: "********" })
                    ),
                    React.createElement('div', {className: 'input-group'},
                        React.createElement('label', {htmlFor: 'adminNewUserProfile'}, 'Perfil do Usuário:'),
                        React.createElement('select', { id: 'adminNewUserProfile', value: userProfile, onChange: e => setUserProfile(e.target.value) },
                            boardData.profiles.map(profile => 
                                React.createElement('option', { key: profile, value: profile }, profile)
                            )
                        )
                    )
                ),
                React.createElement('button', {type: 'submit', className: 'btn btn-md btn-success', style: {marginTop: '10px'}}, 'Criar Usuário')
            ),
            React.createElement('h4', {style: {marginTop: '25px', marginBottom: '10px', fontSize: '16px'}}, 'Usuários Existentes:'),
            React.createElement('table', { className: 'admin-table' },
                React.createElement('thead', null, 
                    React.createElement('tr', null,
                        React.createElement('th', null, 'Usuário'),
                        React.createElement('th', null, 'Perfil'),
                        React.createElement('th', {className: 'action-cell'}, 'Ações')
                    )
                ),
                React.createElement('tbody', null, 
                    boardData.users.map(user => React.createElement('tr', {key: user.id},
                        React.createElement('td', null, user.username),
                        React.createElement('td', null, user.profile),
                        React.createElement('td', {className: 'action-cell'}, 
                            React.createElement('button', {className: 'btn btn-sm btn-warning', onClick: () => openEditModal('user', user)}, 'Editar'),
                            user.username !== 'admin' && React.createElement('button', {className: 'btn btn-sm btn-danger', onClick: () => onAdminDeleteUser(user.id)}, 'Excluir')
                        )
                    ))
                )
            )
        ),
        
        React.createElement('div', { className: 'admin-section' },
            React.createElement('h3', null, 'Gerenciar Tarefas (Cartões)'),
            React.createElement(AddItemForm, { 
                buttonText: "Criar Novo Cartão", 
                onSubmit: handleAdminCreateCardSubmit, 
                onCancel: () => { setAdminNewCardText(''); setAdminNewCardProfile('Global'); setAdminNewCardColorHex(''); },
                isCardForm: false 
            }, 
              React.createElement(React.Fragment, null,
                  React.createElement('div', {className: 'input-group'},
                      React.createElement('label', {htmlFor: 'adminPanelCardText'}, 'Texto do Cartão:'),
                      React.createElement('textarea', { id: 'adminPanelCardText', value: adminNewCardText, onChange: e => setAdminNewCardText(e.target.value), placeholder: "Descrição da tarefa...", rows: 3, required: true })
                  ),
                   React.createElement('div', { className: 'form-grid' },
                      React.createElement('div', {className: 'input-group'},
                          React.createElement('label', {htmlFor: 'adminPanelCardList'}, 'Adicionar à Lista:'),
                          React.createElement('select', { id: 'adminPanelCardList', value: adminNewCardListId, onChange: e => setAdminNewCardListId(e.target.value), required: true },
                              boardData.listOrder.map(listId => 
                                  React.createElement('option', { key: listId, value: listId }, boardData.lists[listId].title)
                              )
                          )
                      ),
                      React.createElement('div', {className: 'input-group'},
                          React.createElement('label', {htmlFor: 'adminPanelCardProfile'}, 'Perfil de Visualização:'),
                          React.createElement('select', { id: 'adminPanelCardProfile', value: adminNewCardProfile, onChange: e => setAdminNewCardProfile(e.target.value) },
                              boardData.profiles.map(profile => 
                                  React.createElement('option', { key: profile, value: profile }, profile)
                              )
                          )
                      ),
                      React.createElement('div', {className: 'input-group'},
                          React.createElement('label', {htmlFor: 'adminPanelCardColor'}, 'Cor/Etiqueta:'),
                          React.createElement('select', { id: 'adminPanelCardColor', value: adminNewCardColorHex, onChange: e => setAdminNewCardColorHex(e.target.value) },
                              React.createElement('option', { value: '' }, 'Nenhuma'),
                              boardData.labelColors.map(color =>
                                  React.createElement('option', { key: color.id, value: color.hex, style: { backgroundColor: color.hex, color: color.hex === '#f2d600' || color.hex === '#ffffff' ? '#000' : '#fff' } }, color.name)
                              )
                          )
                      )
                  )
              )
            ),
            React.createElement('h4', {style: {marginTop: '25px', marginBottom: '10px', fontSize: '16px'}}, 'Cartões Existentes:'),
            React.createElement('table', { className: 'admin-table' },
                React.createElement('thead', null, 
                    React.createElement('tr', null,
                        React.createElement('th', null, 'Texto do Cartão'),
                        React.createElement('th', null, 'Lista'),
                        React.createElement('th', null, 'Perfil'),
                        React.createElement('th', null, 'Cor'),
                        React.createElement('th', {className: 'action-cell'}, 'Ações')
                    )
                ),
                React.createElement('tbody', null, 
                    Object.values(boardData.cards).map(card => {
                        const listTitle = boardData.listOrder.reduce((acc, listId) => {
                            if (boardData.lists[listId] && boardData.lists[listId].cardIds.includes(card.id)) return boardData.lists[listId].title;
                            return acc;
                        }, 'N/A');
                        return React.createElement('tr', {key: card.id},
                            React.createElement('td', {title: card.text}, card.text.substring(0,50) + (card.text.length > 50 ? '...' : '')),
                            React.createElement('td', null, listTitle),
                            React.createElement('td', null, card.profile),
                            React.createElement('td', null, card.color ? React.createElement('span', {className:'color-swatch', style:{backgroundColor: card.color, display: 'inline-block', border: '1px solid #ccc'}}) : 'Nenhuma'),
                            React.createElement('td', {className: 'action-cell'}, 
                                React.createElement('button', {className: 'btn btn-sm btn-warning', onClick: () => openEditModal('card', card)}, 'Editar')
                            )
                        )
                    })
                )
            )
        ),

        React.createElement('div', { className: 'admin-section' },
            React.createElement('h3', null, 'Gerenciar Perfis de Visualização'),
            /* ... formulário e tabela como na versão anterior ... */
        ),

        React.createElement('div', { className: 'admin-section' },
            React.createElement('h3', null, 'Gerenciar Cores/Etiquetas'),
            /* ... formulário e tabela como na versão anterior ... */
        )
    );
}

// Novo componente para o Mapa das Obras
function MapPanel({obras, onMapReady, onDrawnItemCreate, boardData, onAssociateDrawingToCard}) { 
    const mapRef = useRef(null); 
    const leafletMapRef = useRef(null); 
    const [mapInitialized, setMapInitialized] = useState(false);
    const drawnItemsRef = useRef(null); 
    const [showAssociateModal, setShowAssociateModal] = useState(false);
    const [currentGeoJson, setCurrentGeoJson] = useState(null);


    const invalidateMapSize = useCallback(() => {
        if (leafletMapRef.current) {
            setTimeout(() => {
                leafletMapRef.current.invalidateSize(true); 
            }, 150); 
        }
    }, []);

     useEffect(() => {
        if (onMapReady && typeof onMapReady === 'function') {
            onMapReady({ invalidateMapSize });
        }
    }, [onMapReady, invalidateMapSize]);


    useEffect(() => {
        if (mapRef.current && !leafletMapRef.current && typeof L !== 'undefined') {
            L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.9.4/dist/images/';

            const mapCenter = [-22.9193, -42.8231]; // Maricá, RJ
            leafletMapRef.current = L.map(mapRef.current).setView(mapCenter, 13); // Zoom 13 para ver a cidade

            // Camada de Satélite (ESRI World Imagery) como padrão
            const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri',
                maxZoom: 19 
            }).addTo(leafletMapRef.current);

            // Camada de Mapa Padrão (OpenStreetMap)
            const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 20 
            });
            
            const baseMaps = { 
                "Satélite": satelliteLayer,
                "Padrão (Ruas)": osmLayer
            };
            L.control.layers(baseMaps).addTo(leafletMapRef.current);

            drawnItemsRef.current = new L.FeatureGroup(); 
            leafletMapRef.current.addLayer(drawnItemsRef.current);
            
            // Tradução dos controles de desenho
            L.drawLocal.draw.toolbar.actions.title = 'Cancelar desenho';
            L.drawLocal.draw.toolbar.actions.text = 'Cancelar';
            L.drawLocal.draw.toolbar.finish.title = 'Finalizar desenho';
            L.drawLocal.draw.toolbar.finish.text = 'Finalizar';
            L.drawLocal.draw.toolbar.undo.title = 'Excluir último ponto desenhado';
            L.drawLocal.draw.toolbar.undo.text = 'Excluir último ponto';
            L.drawLocal.draw.toolbar.buttons.polyline = 'Desenhar uma linha';
            L.drawLocal.draw.toolbar.buttons.polygon = 'Desenhar um polígono';
            L.drawLocal.draw.toolbar.buttons.rectangle = 'Desenhar um retângulo';
            L.drawLocal.draw.toolbar.buttons.circle = 'Desenhar um círculo';
            L.drawLocal.draw.toolbar.buttons.marker = 'Adicionar um marcador';

            L.drawLocal.draw.handlers.circle.tooltip.start = 'Clique e arraste para desenhar o círculo.';
            L.drawLocal.draw.handlers.circle.radius = 'Raio';
            L.drawLocal.draw.handlers.marker.tooltip.start = 'Clique no mapa para posicionar o marcador.';
            L.drawLocal.draw.handlers.polygon.tooltip.start = 'Clique para começar a desenhar a forma.';
            L.drawLocal.draw.handlers.polygon.tooltip.cont = 'Clique para continuar a desenhar a forma.';
            L.drawLocal.draw.handlers.polygon.tooltip.end = 'Clique no primeiro ponto para fechar esta forma.';
            L.drawLocal.draw.handlers.polyline.error = '<strong>Erro:</strong> as bordas da forma não podem cruzar!';
            L.drawLocal.draw.handlers.polyline.tooltip.start = 'Clique para começar a desenhar a linha.';
            L.drawLocal.draw.handlers.polyline.tooltip.cont = 'Clique para continuar a desenhar a linha.';
            L.drawLocal.draw.handlers.polyline.tooltip.end = 'Clique no último ponto para finalizar a linha.';
            L.drawLocal.draw.handlers.rectangle.tooltip.start = 'Clique e arraste para desenhar o retângulo.';
            L.drawLocal.draw.handlers.simpleshape.tooltip.end = 'Solte o rato para finalizar o desenho.';

            L.drawLocal.edit.toolbar.actions.save.title = 'Salvar alterações.';
            L.drawLocal.edit.toolbar.actions.save.text = 'Salvar';
            L.drawLocal.edit.toolbar.actions.cancel.title = 'Cancelar edição, descarta todas as alterações.';
            L.drawLocal.edit.toolbar.actions.cancel.text = 'Cancelar';
            L.drawLocal.edit.toolbar.actions.clearAll.title = 'Limpar todas as camadas.';
            L.drawLocal.edit.toolbar.actions.clearAll.text = 'Limpar Tudo';
            L.drawLocal.edit.toolbar.buttons.edit = 'Editar camadas.';
            L.drawLocal.edit.toolbar.buttons.editDisabled = 'Nenhuma camada para editar.';
            L.drawLocal.edit.toolbar.buttons.remove = 'Excluir camadas.';
            L.drawLocal.edit.toolbar.buttons.removeDisabled = 'Nenhuma camada para excluir.';
            L.drawLocal.edit.handlers.edit.tooltip.text = 'Arraste os marcadores ou pontos para editar a forma.';
            L.drawLocal.edit.handlers.edit.tooltip.subtext = 'Clique em cancelar para desfazer as alterações.';
            L.drawLocal.edit.handlers.remove.tooltip.text = 'Clique numa forma para removê-la.';


            const drawControl = new L.Control.Draw({
                edit: { featureGroup: drawnItemsRef.current },
                draw: {
                    polygon: { allowIntersection: false, showArea: true, metric: true, shapeOptions: { color: '#E91E63', weight: 2, opacity: 0.8, fillOpacity: 0.3 } }, 
                    polyline: { shapeOptions: { color: '#03A9F4', weight: 3, opacity: 0.9 } }, 
                    rectangle: { shapeOptions: { color: '#4CAF50', weight: 2, opacity: 0.8, fillOpacity: 0.3 } },
                    circle: {shapeOptions: { color: '#FF9800', weight: 2, opacity: 0.8, fillOpacity: 0.3 }}, 
                    marker: { icon: new L.Icon.Default() }, 
                    circlemarker: false 
                }
            });
            leafletMapRef.current.addControl(drawControl);

            leafletMapRef.current.on(L.Draw.Event.CREATED, function (event) {
                const layer = event.layer;
                const geoJsonData = layer.toGeoJSON();
                let measurement = '';
                let measurementValue = 0;
                let measurementUnit = '';

                if (layer instanceof L.Polygon || layer instanceof L.Rectangle || layer instanceof L.Circle) {
                    let area = 0;
                    if (layer instanceof L.Circle) {
                        area = Math.PI * Math.pow(layer.getRadius(), 2);
                    } else { // Polygon ou Rectangle
                        const latlngs = layer.getLatLngs();
                        if (latlngs && latlngs.length > 0 && latlngs[0].length > 2) { // Verifica se é um polígono válido
                             area = L.GeometryUtil.geodesicArea(latlngs[0]);
                        }
                    }
                    measurementValue = area.toFixed(2);
                    measurementUnit = 'm²';
                    measurement = `${measurementValue} ${measurementUnit}`;
                } else if (layer instanceof L.Polyline) {
                    let length = 0;
                    const latlngs = layer.getLatLngs();
                    for (let i = 0; i < latlngs.length - 1; i++) {
                        length += leafletMapRef.current.distance(latlngs[i], latlngs[i+1]);
                    }
                    measurementValue = length.toFixed(2);
                    measurementUnit = 'm';
                    measurement = `${measurementValue} ${measurementUnit}`;
                }
                setCurrentGeoJson({geoJson: geoJsonData, measurement: measurement, measurementValue: parseFloat(measurementValue), measurementUnit: measurementUnit, layerType: event.layerType}); 
                setShowAssociateModal(true); 
            });
            setMapInitialized(true); 
        }
        return () => {
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
                setMapInitialized(false);
            }
        };
    }, []); 

    useEffect(() => {
        if (mapInitialized && leafletMapRef.current && obras) {
            leafletMapRef.current.eachLayer(layer => {
                if (layer instanceof L.Marker && !(layer instanceof L.Draw.Marker) && !drawnItemsRef.current.hasLayer(layer) ) {
                     if (!layer.hasOwnProperty('_drawnByPlugin')) { 
                        leafletMapRef.current.removeLayer(layer);
                    }
                }
            });
            drawnItemsRef.current.clearLayers();

            obras.forEach(obra => {
                if (obra.location && typeof obra.location.lat === 'number' && typeof obra.location.lng === 'number') {
                    const marker = L.marker([obra.location.lat, obra.location.lng]);
                    marker._drawnByPlugin = false; 
                    marker.addTo(leafletMapRef.current)
                        .bindPopup(`<b>${obra.text.substring(0,30)}...</b><br>Perfil: ${obra.profile || 'N/A'}`);
                }
                if (obra.mapFeatures && Array.isArray(obra.mapFeatures)) {
                    obra.mapFeatures.forEach(feature => {
                        try {
                            const featureLayer = L.geoJSON(feature.geoJsonData, {
                                style: function() { return { color: feature.color || '#3388ff', weight: feature.geoJsonData.geometry.type === 'LineString' ? 3 : 2, opacity: 0.9, fillOpacity: 0.3 }; } 
                            }).bindPopup(`<b>${feature.name || feature.category || 'Desenho'}</b><br>${feature.description || ''}<br>OS: ${boardData.cards[feature.osId]?.text.substring(0,30) || 'N/A'}<br>Medida: ${feature.measurementValue || ''} ${feature.measurementUnit || ''}`);
                            drawnItemsRef.current.addLayer(featureLayer); 
                        } catch (e) {
                            console.error("Erro ao adicionar GeoJSON ao mapa:", e, feature);
                        }
                    });
                }
            });
        }
    }, [obras, mapInitialized, boardData.cards]); 
    
    const handleAssociateDrawing = (cardId, markingName, drawingType, description, color, productivity, materials, measurement) => {
        if (currentGeoJson && cardId) {
            onAssociateDrawingToCard(cardId, {
                geoJsonData: currentGeoJson.geoJson,
                name: markingName,
                category: drawingType,
                description: description,
                color: color,
                productivityNotes: productivity ? [productivity] : [], 
                associatedMaterials: materials ? [materials] : [],
                measurementValue: measurement.value,
                measurementUnit: measurement.unit,
                shapeType: currentGeoJson.layerType 
            });
        }
        setShowAssociateModal(false);
        setCurrentGeoJson(null);
    };


    return React.createElement('div', {className: 'map-panel-content'},
        React.createElement('h2', null, 'Mapa das Obras'),
        React.createElement('div', { id: 'mapContainer', ref: mapRef, style: { visibility: mapInitialized || window.L ? 'visible' : 'hidden'} }, 
            !window.L && React.createElement('p', null, 'A carregar biblioteca de mapa...')
        ),
        showAssociateModal && React.createElement(Modal, {
            isOpen: showAssociateModal,
            onClose: () => { setShowAssociateModal(false); setCurrentGeoJson(null); },
            title: "Detalhes da Marcação e Associação à OS",
            size: "large" 
        },
            React.createElement(AssociateDrawingForm, {
                cards: Object.values(boardData.cards),
                drawingTypes: boardData.drawingTypes,
                initialMeasurement: currentGeoJson?.measurement, 
                onSubmit: handleAssociateDrawing,
                onCancel: () => { setShowAssociateModal(false); setCurrentGeoJson(null); }
            })
        )
    );
}

// Novo componente para o formulário de associação de desenho
function AssociateDrawingForm({ cards, drawingTypes, onSubmit, onCancel, initialMeasurement = '', initialMarkingName = '', initialDrawingType = '', initialDescription = '', initialColor = '', initialProductivity = '', initialMaterials = '', initialCardId = '', isEditing = false }) {
    const [selectedCardId, setSelectedCardId] = useState(initialCardId);
    const [markingName, setMarkingName] = useState(initialMarkingName); 
    const [selectedDrawingType, setSelectedDrawingType] = useState(initialDrawingType || (drawingTypes.length > 0 ? drawingTypes[0].value : ''));
    const [description, setDescription] = useState(initialDescription);
    const [customColor, setCustomColor] = useState(initialColor || (drawingTypes.length > 0 ? drawingTypes.find(dt => dt.value === selectedDrawingType)?.defaultColor : '#3388ff'));
    const [productivity, setProductivity] = useState(initialProductivity); 
    const [materials, setMaterials] = useState(initialMaterials); 
    const [measurementDisplay, setMeasurementDisplay] = useState(initialMeasurement);


    useEffect(() => { 
        if (!isEditing) { 
            const type = drawingTypes.find(dt => dt.value === selectedDrawingType);
            if (type) setCustomColor(type.defaultColor);
        }
    }, [selectedDrawingType, drawingTypes, isEditing]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedCardId) {
            alert("Por favor, selecione uma OS (Cartão) para associar o desenho.");
            return;
        }
         if (!markingName.trim()) {
            alert("Por favor, dê um nome para a marcação.");
            return;
        }
        const [value, unit] = measurementDisplay.split(' ');
        onSubmit(selectedCardId, markingName.trim(), selectedDrawingType, description, customColor, productivity, materials, {value: parseFloat(value) || 0, unit: unit || ''});
    };

    return React.createElement('form', { onSubmit: handleSubmit, className: 'add-item-form' },
        React.createElement('div', {className: 'input-group'},
            React.createElement('label', {htmlFor: 'associateCardSelect'}, 'Associar à OS (Cartão):'),
            React.createElement('select', { 
                id: 'associateCardSelect', 
                value: selectedCardId, 
                onChange: e => setSelectedCardId(e.target.value),
                required: true 
            },
                React.createElement('option', {value: '', disabled: true}, '-- Selecione um Cartão --'),
                cards.map(card => 
                    React.createElement('option', {key: card.id, value: card.id}, card.text.substring(0,50) + (card.text.length > 50 ? '...' : ''))
                )
            )
        ),
        React.createElement('div', {className: 'input-group'},
            React.createElement('label', {htmlFor: 'markingNameInput'}, 'Nome da Marcação:'),
            React.createElement('input', { 
                type: 'text',
                id: 'markingNameInput', 
                value: markingName, 
                onChange: e => setMarkingName(e.target.value), 
                placeholder: "Ex: Vala Principal Bloco A",
                required: true 
            })
        ),
        React.createElement('div', {className: 'input-group'},
            React.createElement('label', {htmlFor: 'drawingTypeSelect'}, 'Tipo de Desenho:'),
            React.createElement('select', { 
                id: 'drawingTypeSelect', 
                value: selectedDrawingType, 
                onChange: e => setSelectedDrawingType(e.target.value) 
            },
                drawingTypes.map(type => 
                    React.createElement('option', {key: type.value, value: type.value}, type.label)
                )
            )
        ),
         React.createElement('div', {className: 'input-group'},
            React.createElement('label', {htmlFor: 'drawingMeasurement'}, 'Medida Calculada:'),
            React.createElement('input', { 
                type: 'text',
                id: 'drawingMeasurement', 
                value: measurementDisplay, 
                onChange: e => setMeasurementDisplay(e.target.value), 
                placeholder: "Ex: 150.5 m ou 75.2 m²"
            })
        ),
        React.createElement('div', {className: 'input-group color-picker-wrapper'},
            React.createElement('label', {htmlFor: 'drawingColorPicker'}, 'Cor do Desenho:'),
            React.createElement('input', {type: 'color', id: 'drawingColorPicker', value: customColor, onChange: e => setCustomColor(e.target.value)}),
            React.createElement('span', null, customColor)
        ),
        React.createElement('div', {className: 'input-group'},
            React.createElement('label', {htmlFor: 'drawingDescription'}, 'Descrição Adicional:'),
            React.createElement('textarea', { 
                id: 'drawingDescription', 
                value: description, 
                onChange: e => setDescription(e.target.value), 
                rows: 2,
                placeholder: "Detalhes sobre a marcação..."
            })
        ),
         React.createElement('div', {className: 'input-group'},
            React.createElement('label', {htmlFor: 'drawingProductivity'}, 'Notas de Produtividade:'),
            React.createElement('textarea', { id: 'drawingProductivity', value: productivity, onChange: e => setProductivity(e.target.value), rows: 2, placeholder: "Ex: 50m concluídos hoje." })
        ),
         React.createElement('div', {className: 'input-group'},
            React.createElement('label', {htmlFor: 'drawingMaterials'}, 'Materiais Associados:'),
            React.createElement('textarea', { id: 'drawingMaterials', value: materials, onChange: e => setMaterials(e.target.value), rows: 2, placeholder: "Ex: Cimento: 10 sacos; Areia: 1m³" })
        ),
        React.createElement('div', { className: 'add-item-actions' },
            React.createElement('button', { type: 'submit', className: 'btn btn-success btn-sm' }, isEditing ? "Salvar Alterações" : "Salvar Marcação"),
            React.createElement('button', { type: 'button', className: 'close-form-btn', onClick: onCancel, title: "Cancelar" }, '×')
        )
    );
}

// Novo Componente: MarkingsListPanel
function MarkingsListPanel({ boardData, onEditMarking, onDeleteMarking, onViewMarkingOnMap }) {
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportData, setExportData] = useState('');

    const handleExportData = () => {
        let dataString = "Nome Marcação\tTipo/Categoria\tOS Associada\tDescrição\tCor\tMedida\tUnidade\tProdutividade\tMateriais\n";
        Object.values(boardData.cards).forEach(card => {
            (card.mapFeatures || []).forEach(feature => {
                dataString += `${feature.name || '-'}\t`;
                dataString += `${feature.category || '-'}\t`;
                dataString += `${card.text.substring(0,30)}...\t`;
                dataString += `${feature.description || '-'}\t`;
                dataString += `${feature.color || '-'}\t`;
                dataString += `${feature.measurementValue || '-'}\t`;
                dataString += `${feature.measurementUnit || '-'}\t`;
                dataString += `${(feature.productivityNotes || []).join('; ') || '-'}\t`; 
                dataString += `${(feature.associatedMaterials || []).join('; ') || '-'}\n`;
            });
        });
        setExportData(dataString);
        setShowExportModal(true);
    };


    return React.createElement('div', { className: 'markings-list-panel-content' },
        React.createElement('h2', null, 'Lista de Marcações do Mapa'),
        React.createElement('div', {className: 'export-button-container'},
            React.createElement('button', {className: 'btn btn-sm', onClick: handleExportData}, 'Exportar Dados para Copiar')
        ),
        React.createElement('table', { className: 'admin-table' },
            React.createElement('thead', null,
                React.createElement('tr', null,
                    React.createElement('th', null, 'Nome da Marcação'),
                    React.createElement('th', null, 'Tipo/Categoria'),
                    React.createElement('th', null, 'OS Associada'),
                    React.createElement('th', null, 'Medida'),
                    React.createElement('th', null, 'Cor'),
                    React.createElement('th', {className: 'action-cell'}, 'Ações')
                )
            ),
            React.createElement('tbody', null,
                Object.values(boardData.cards).flatMap(card => 
                    (card.mapFeatures || []).map(feature => 
                        React.createElement('tr', { key: feature.id },
                            React.createElement('td', {title: feature.description}, feature.name || feature.category || 'Sem nome'),
                            React.createElement('td', null, feature.category),
                            React.createElement('td', null, card.text.substring(0,30) + (card.text.length > 30 ? '...' : '')),
                            React.createElement('td', null, `${feature.measurementValue || ''} ${feature.measurementUnit || ''}`),
                            React.createElement('td', null, 
                                feature.color ? React.createElement('span', {className:'color-swatch', style:{backgroundColor: feature.color, display: 'inline-block', border: '1px solid #ccc'}}) : 'N/A'
                            ),
                            React.createElement('td', {className: 'action-cell'},
                                React.createElement('button', {className: 'btn btn-sm btn-warning', onClick: () => onEditMarking(card.id, feature.id)}, 'Editar'),
                                React.createElement('button', {className: 'btn btn-sm btn-danger', onClick: () => onDeleteMarking(card.id, feature.id)}, 'Excluir'),
                                React.createElement('button', {className: 'btn btn-sm', onClick: () => onViewMarkingOnMap(feature.geoJsonData)}, 'Ver Mapa')
                            )
                        )
                    )
                )
            )
        ),
        showExportModal && React.createElement(Modal, {
            isOpen: showExportModal,
            onClose: () => setShowExportModal(false),
            title: "Exportar Dados das Marcações",
            size: "large"
        },
            React.createElement('p', null, "Selecione e copie o texto abaixo para colar em sua planilha:"),
            React.createElement('textarea', {className: 'export-data-textarea', readOnly: true, value: exportData})
        )
    );
}


// Componente Principal da Aplicação (Layout com Sidebar)
function TrelloCloneAppLayout() {
    const [board, setBoard] = useState(initialBoardData);
    const [currentView, setCurrentView] = useState('board'); 
    let loggedInUser = "Usuário"; 
    const usernameInputEl = document.getElementById('username');
    if (usernameInputEl && usernameInputEl.value) {
         loggedInUser = usernameInputEl.value;
    }
    const isAdmin = loggedInUser === 'admin'; 
    const mapPanelApiRef = useRef(null); 
    const [associatingDrawToCard, setAssociatingDrawToCard] = useState(null); 
    const [editingMapFeature, setEditingMapFeature] = useState(null); 


    const handleLogout = () => {
        const globalLogoutBtn = document.querySelector('.sidebar-footer .logout-btn');
        if(globalLogoutBtn) globalLogoutBtn.click();
    };
    
    // Funções CRUD
    const addList = (title) => { 
        const newListId = `list-${Date.now()}`;
        const newList = { id: newListId, title: title, cardIds: [] };
        setBoard(prevBoard => ({
            ...prevBoard,
            lists: { ...prevBoard.lists, [newListId]: newList },
            listOrder: [...prevBoard.listOrder, newListId],
        }));
    };
    const addCardToListFromBoard = (listId, cardData) => { 
        const newCardId = `card-${Date.now()}`;
        const newCard = { 
            id: newCardId, 
            ...cardData, 
            mapFeatures: cardData.mapFeatures || [], 
            productivityNotes: cardData.productivityNotes || [], 
            associatedMaterials: cardData.associatedMaterials || [] 
        }; 
        setBoard(prevBoard => {
            const targetList = prevBoard.lists[listId];
            if (!targetList || !targetList.cardIds) return prevBoard;
            return {
                ...prevBoard,
                cards: { ...prevBoard.cards, [newCardId]: newCard },
                lists: {
                    ...prevBoard.lists,
                    [listId]: { ...targetList, cardIds: [...targetList.cardIds, newCardId] },
                },
            };
        });
    };
    const adminCreateCard = (cardDetails) => { 
        addCardToListFromBoard(cardDetails.listId, { 
            text: cardDetails.text, 
            profile: cardDetails.profile, 
            color: cardDetails.color,
            location: cardDetails.location || null 
        });
        alert(`Cartão "${cardDetails.text.substring(0,20)}..." criado com sucesso!`);
    };
    const adminUpdateCard = (cardId, updatedDetails, newListId) => {
        setBoard(prevBoard => {
            const oldCard = prevBoard.cards[cardId];
            if (!oldCard) return prevBoard;
            const newCardData = { 
                ...oldCard, 
                ...updatedDetails,
                mapFeatures: updatedDetails.mapFeatures !== undefined ? updatedDetails.mapFeatures : oldCard.mapFeatures,
                productivityNotes: updatedDetails.productivityNotes !== undefined ? updatedDetails.productivityNotes : oldCard.productivityNotes,
                associatedMaterials: updatedDetails.associatedMaterials !== undefined ? updatedDetails.associatedMaterials : oldCard.associatedMaterials,
                location: updatedDetails.location !== undefined ? updatedDetails.location : oldCard.location
            };
            const newCards = { ...prevBoard.cards, [cardId]: newCardData };
            let newListsData = { ...prevBoard.lists };
            let oldListId = null;
            for (const listId of prevBoard.listOrder) {
                if (prevBoard.lists[listId] && prevBoard.lists[listId].cardIds.includes(cardId)) {
                    oldListId = listId;
                    break;
                }
            }
            if (oldListId && newListId && oldListId !== newListId) {
                const oldListCardIds = newListsData[oldListId].cardIds.filter(id => id !== cardId);
                newListsData[oldListId] = { ...newListsData[oldListId], cardIds: oldListCardIds };
                const targetListCardIds = [...(newListsData[newListId].cardIds || []), cardId];
                newListsData[newListId] = { ...newListsData[newListId], cardIds: targetListCardIds };
            }
            alert(`Cartão "${updatedDetails.text.substring(0,20)}..." atualizado!`);
            return { ...prevBoard, cards: newCards, lists: newListsData };
        });
    };
     const adminAddProfile = (profileName) => { 
        setBoard(prevBoard => {
            if (prevBoard.profiles.includes(profileName)) {
                alert(`Perfil "${profileName}" já existe.`);
                return prevBoard; 
            }
            return { ...prevBoard, profiles: [...prevBoard.profiles, profileName] };
        });
    };
    const adminDeleteProfile = (profileNameToDelete) => { 
        if (profileNameToDelete === "Global") {
            alert("O perfil 'Global' não pode ser excluído.");
            return;
        }
        if (!confirm(`Tem certeza que deseja excluir o perfil "${profileNameToDelete}"? Cartões e usuários com este perfil serão afetados.`)) {
            return;
        }
        setBoard(prevBoard => ({
            ...prevBoard,
            profiles: prevBoard.profiles.filter(p => p !== profileNameToDelete),
            cards: Object.fromEntries(Object.entries(prevBoard.cards).map(([id, card]) => 
                card.profile === profileNameToDelete ? [id, {...card, profile: "Global"}] : [id, card]
            )),
            users: prevBoard.users.map(user => 
                user.profile === profileNameToDelete ? { ...user, profile: "Global" } : user
            )
        }));
         alert(`Perfil "${profileNameToDelete}" excluído. Itens associados foram movidos para 'Global'.`);
    };
    const adminUpdateProfile = (oldProfileName, newProfileName) => {
        setBoard(prevBoard => {
            if (oldProfileName === "Global") {
                alert("O perfil 'Global' não pode ser renomeado.");
                return prevBoard;
            }
            if (prevBoard.profiles.includes(newProfileName) && oldProfileName !== newProfileName) {
                alert(`O nome de perfil "${newProfileName}" já existe.`);
                return prevBoard;
            }
            const updatedProfiles = prevBoard.profiles.map(p => p === oldProfileName ? newProfileName : p);
            const updatedCards = { ...prevBoard.cards };
            Object.keys(updatedCards).forEach(cardId => {
                if (updatedCards[cardId].profile === oldProfileName) {
                    updatedCards[cardId].profile = newProfileName;
                }
            });
            const updatedUsers = prevBoard.users.map(user => 
                user.profile === oldProfileName ? { ...user, profile: newProfileName } : user
            );
            alert(`Perfil "${oldProfileName}" atualizado para "${newProfileName}".`);
            return { ...prevBoard, profiles: updatedProfiles, cards: updatedCards, users: updatedUsers };
        });
    };
    const adminAddLabelColor = (colorObject) => { 
        const newColorId = `color-${Date.now()}`;
        setBoard(prevBoard => ({
            ...prevBoard,
            labelColors: [...prevBoard.labelColors, {id: newColorId, ...colorObject}]
        }));
    };
    const adminDeleteLabelColor = (colorIdToDelete) => { 
        if (!confirm(`Tem certeza que deseja excluir esta cor/etiqueta?`)) {
            return;
        }
         setBoard(prevBoard => ({
            ...prevBoard,
            labelColors: prevBoard.labelColors.filter(c => c.id !== colorIdToDelete),
            cards: Object.fromEntries(Object.entries(prevBoard.cards).map(([id, card]) => {
                const colorToDelete = prevBoard.labelColors.find(lc => lc.id === colorIdToDelete);
                return card.color === colorToDelete?.hex ? [id, {...card, color: null}] : [id, card];
            })),
        }));
         alert(`Cor/Etiqueta excluída. Cartões associados perderam esta cor.`);
    };
    const adminUpdateLabelColor = (colorId, updatedColor) => { 
         setBoard(prevBoard => {
            const oldColorHex = prevBoard.labelColors.find(lc => lc.id === colorId)?.hex;
            const newLabelColors = prevBoard.labelColors.map(lc => lc.id === colorId ? { ...lc, ...updatedColor } : lc);
            let newCards = { ...prevBoard.cards };
            if (oldColorHex && oldColorHex !== updatedColor.hex) {
                Object.keys(newCards).forEach(cardId => {
                    if (newCards[cardId].color === oldColorHex) {
                        newCards[cardId].color = updatedColor.hex;
                    }
                });
            }
            alert(`Cor/Etiqueta "${updatedColor.name}" atualizada.`);
            return { ...prevBoard, labelColors: newLabelColors, cards: newCards };
        });
    };
    const adminCreateUser = (userDetails) => { 
        setBoard(prevBoard => {
            if (prevBoard.users.find(u => u.username === userDetails.username)) {
                alert(`Usuário "${userDetails.username}" já existe.`);
                return prevBoard;
            }
            const newUserId = `user-${Date.now()}`;
            const newUser = { id: newUserId, username: userDetails.username, profile: userDetails.profile };
            alert(`Usuário "${userDetails.username}" criado (simulado).`);
            return {...prevBoard, users: [...prevBoard.users, newUser]};
        });
    };
    const adminDeleteUser = (userIdToDelete) => { 
        const userToDelete = board.users.find(u => u.id === userIdToDelete);
        if (userToDelete && userToDelete.username === 'admin') {
            alert("O usuário 'admin' não pode ser excluído.");
            return;
        }
        if (!confirm(`Tem certeza que deseja excluir o usuário "${userToDelete?.username}"?`)) {
            return;
        }
        setBoard(prevBoard => ({
            ...prevBoard,
            users: prevBoard.users.filter(u => u.id !== userIdToDelete)
        }));
         alert(`Usuário "${userToDelete?.username}" excluído.`);
    };
    const adminUpdateUser = (userId, updatedUserDetails) => { 
        setBoard(prevBoard => {
            const userToUpdate = prevBoard.users.find(u => u.id === userId);
            if (userToUpdate && userToUpdate.username === 'admin' && updatedUserDetails.username !== 'admin') {
                 alert("Não é possível renomear o usuário 'admin'.");
                 return prevBoard;
            }
            if (prevBoard.users.find(u => u.username === updatedUserDetails.username && u.id !== userId)) {
                alert(`O nome de usuário "${updatedUserDetails.username}" já está em uso.`);
                return prevBoard;
            }
            return {
                ...prevBoard,
                users: prevBoard.users.map(u => u.id === userId ? { ...u, ...updatedUserDetails } : u)
            }
        });
         alert(`Usuário "${updatedUserDetails.username}" atualizado.`);
    };
    const handleDragEnd = (result) => { 
        const { destination, source, draggableId, type } = result;
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return; 
        }
        const startList = board.lists[source.droppableId];
        const finishList = board.lists[destination.droppableId];
        if (!startList || !finishList) return;
        if (startList === finishList) { 
            const newCardIds = Array.from(startList.cardIds);
            newCardIds.splice(source.index, 1); 
            newCardIds.splice(destination.index, 0, draggableId); 
            const newList = { ...startList, cardIds: newCardIds };
            setBoard(prev => ({ ...prev, lists: { ...prev.lists, [newList.id]: newList } }));
            return;
        }
        const startCardIds = Array.from(startList.cardIds);
        startCardIds.splice(source.index, 1); 
        const newStartList = { ...startList, cardIds: startCardIds };
        const finishCardIds = Array.from(finishList.cardIds);
        finishCardIds.splice(destination.index, 0, draggableId); 
        const newFinishList = { ...finishList, cardIds: finishCardIds };
        setBoard(prev => ({
            ...prev,
            lists: { ...prev.lists, [newStartList.id]: newStartList, [newFinishList.id]: newFinishList },
        }));
    };

    const handleDrawnItemCreate = (geoJsonDataWithMeasurement) => { 
        setAssociatingDrawToCard(geoJsonDataWithMeasurement); 
    };

    const associateDrawingToCard = (cardId, drawingDetails) => { 
        if (associatingDrawToCard && cardId) {
            setBoard(prevBoard => {
                const cardToUpdate = prevBoard.cards[cardId];
                if (!cardToUpdate) return prevBoard;

                const newMapFeature = {
                    id: `mapfeature-${Date.now()}`, 
                    geoJsonData: associatingDrawToCard.geoJson, 
                    name: drawingDetails.name, 
                    category: drawingDetails.category, 
                    description: drawingDetails.description,
                    color: drawingDetails.color,
                    osId: cardId, 
                    productivityNotes: drawingDetails.productivityNotes, 
                    associatedMaterials: drawingDetails.associatedMaterials,
                    measurementValue: drawingDetails.measurementValue, 
                    measurementUnit: drawingDetails.measurementUnit,
                    shapeType: associatingDrawToCard.layerType 
                };

                const updatedCard = {
                    ...cardToUpdate,
                    mapFeatures: [...(cardToUpdate.mapFeatures || []), newMapFeature]
                };
                return {
                    ...prevBoard,
                    cards: { ...prevBoard.cards, [cardId]: updatedCard }
                };
            });
            alert(`Desenho "${drawingDetails.name || drawingDetails.category}" associado ao cartão: ${board.cards[cardId]?.text.substring(0,30)}...`);
        }
        setAssociatingDrawToCard(null); 
    };
    
    const handleEditMarking = (cardId, featureId) => {
        const card = board.cards[cardId];
        const feature = card?.mapFeatures.find(mf => mf.id === featureId);
        if (card && feature) {
            setEditingMapFeature({cardId, featureId, data: feature});
        }
    };

    const handleDeleteMarking = (cardId, featureId) => {
        if (!confirm("Tem certeza que deseja excluir esta marcação?")) return;
        setBoard(prevBoard => {
            const cardToUpdate = prevBoard.cards[cardId];
            if (!cardToUpdate) return prevBoard;
            const updatedMapFeatures = (cardToUpdate.mapFeatures || []).filter(mf => mf.id !== featureId);
            const updatedCard = { ...cardToUpdate, mapFeatures: updatedMapFeatures };
            return {
                ...prevBoard,
                cards: { ...prevBoard.cards, [cardId]: updatedCard }
            };
        });
        alert("Marcação do mapa excluída.");
    };
    
    const handleUpdateMapFeature = (originalCardId, featureId, updatedFeatureData) => {
         setBoard(prevBoard => {
            let newCards = { ...prevBoard.cards };
            const targetCardId = updatedFeatureData.osId; 

            const originalCard = prevBoard.cards[originalCardId];
            const originalFeature = originalCard?.mapFeatures.find(mf => mf.id === featureId);
            if (!originalFeature) return prevBoard; 

            const updatedFeature = { 
                ...originalFeature, 
                ...updatedFeatureData 
            };

            if (originalCardId !== targetCardId) {
                if (newCards[originalCardId]) {
                   const oldCardFeatures = (newCards[originalCardId].mapFeatures || []).filter(mf => mf.id !== featureId);
                   newCards[originalCardId] = {...newCards[originalCardId], mapFeatures: oldCardFeatures};
                }
                
                const newCardTarget = newCards[targetCardId];
                if (newCardTarget) {
                    newCards[targetCardId] = { 
                        ...newCardTarget, 
                        mapFeatures: [...(newCardTarget.mapFeatures || []), updatedFeature]
                    };
                } else {
                     console.error("Cartão de destino para mover a feature não encontrado:", targetCardId);
                }
            } else { 
                const cardToUpdate = newCards[originalCardId];
                const updatedMapFeatures = (cardToUpdate.mapFeatures || []).map(mf => 
                    mf.id === featureId ? updatedFeature : mf
                );
                newCards[originalCardId] = { ...cardToUpdate, mapFeatures: updatedMapFeatures };
            }
            
            alert("Marcação atualizada!");
            return { ...prevBoard, cards: newCards };
        });
        setEditingMapFeature(null);
    };


    const handleViewMarkingOnMap = (geoJson) => {
        setCurrentView('map');
        setTimeout(() => { 
            if(mapPanelApiRef.current && mapPanelApiRef.current.focusOnGeoJson) {
                mapPanelApiRef.current.focusOnGeoJson(geoJson);
            } else if (mapPanelApiRef.current && mapPanelApiRef.current.invalidateMapSize) {
                mapPanelApiRef.current.invalidateMapSize();
                console.warn("Função focusOnGeoJson não disponível no MapPanel API. Tentando invalidateSize.");
            } else {
                console.warn("API do MapPanel não disponível para focar no GeoJSON.");
            }
        }, 200);
    };


    useEffect(() => {
        if (currentView === 'map' && mapPanelApiRef.current && typeof mapPanelApiRef.current.invalidateMapSize === 'function') {
            mapPanelApiRef.current.invalidateMapSize();
        }
    }, [currentView]);


    return React.createElement('div', { className: 'trello-app-layout' },
        React.createElement('aside', { className: 'sidebar' },
            React.createElement('div', { className: 'sidebar-header' },
                React.createElement('h1', null, 'Construboard') 
            ),
            React.createElement('nav', { className: 'sidebar-nav' },
                React.createElement('ul', null,
                    React.createElement('li', null, 
                        React.createElement('a', { 
                            href: '#', 
                            className: currentView === 'board' ? 'active' : '', 
                            onClick: (e) => { e.preventDefault(); setCurrentView('board'); }
                        }, 
                        React.createElement('svg', {viewBox:"0 0 24 24", width:"18", height:"18", fill:"currentColor"}, React.createElement('path', {d:"M4 4h18v2H4V4zm0 14h18v2H4v-2zm0-7h18v2H4v-2z"}, null)), // Ícone de Tabela/Quadro
                        'Quadro Kanban')
                    ),
                    isAdmin && React.createElement('li', null, 
                        React.createElement('a', { 
                            href: '#', 
                            className: currentView === 'admin' ? 'active' : '', 
                            onClick: (e) => { e.preventDefault(); setCurrentView('admin'); }
                        }, 
                        React.createElement('svg', {viewBox:"0 0 24 24", width:"18", height:"18", fill:"currentColor"}, React.createElement('path', {d:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"}, null)),
                        'Painel Admin')
                    ),
                    React.createElement('li', null, 
                        React.createElement('a', {
                            href: '#',
                            className: currentView === 'map' ? 'active' : '',
                            onClick: (e) => { e.preventDefault(); setCurrentView('map'); }
                        }, 
                        React.createElement('svg', {viewBox:"0 0 24 24", width:"18", height:"18", fill:"currentColor"}, React.createElement('path', {d:"M12 2C8.13 2 5 5.13 5 9c0 4.17 4.42 9.92 6.24 12.11.4.48 1.13.48 1.53 0C14.58 18.92 19 13.17 19 9c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"}, null)),
                        'Mapa das Obras')
                    ),
                     isAdmin && React.createElement('li', null, 
                        React.createElement('a', {
                            href: '#',
                            className: currentView === 'markings' ? 'active' : '',
                            onClick: (e) => { e.preventDefault(); setCurrentView('markings'); }
                        }, 
                        React.createElement('svg', {viewBox:"0 0 24 24", width:"18", height:"18", fill:"currentColor"}, React.createElement('path', {d:"M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"}, null)),
                        'Lista de Marcações')
                    )
                )
            ),
            React.createElement('div', {className: 'sidebar-footer'},
                React.createElement('button', { className: 'logout-btn btn-sm', onClick: handleLogout }, `Sair (${loggedInUser})`)
            )
        ),
        React.createElement('main', { className: 'main-content-area' },
            React.createElement('div', { className: `content-view ${currentView === 'board' ? 'visible' : 'hidden'}`},
                currentView === 'board' && React.createElement(BoardDisplay, { 
                    boardData: board,
                    onAddList: addList,
                    onAddCardToList: addCardToListFromBoard, 
                    onDragEndUpdate: handleDragEnd,
                    currentUserProfile: currentUserProfile,
                    isAdmin: isAdmin
                })
            ),
             React.createElement('div', { className: `content-view ${currentView === 'admin' ? 'visible' : 'hidden'}`},
                currentView === 'admin' && isAdmin && React.createElement(AdminPanel, {
                    boardData: board,
                    onAdminCreateCard: adminCreateCard, onAdminUpdateCard: adminUpdateCard,
                    onAdminAddProfile: adminAddProfile, onAdminDeleteProfile: adminDeleteProfile, onAdminUpdateProfile: adminUpdateProfile,
                    onAdminAddLabelColor: adminAddLabelColor, onAdminDeleteLabelColor: adminDeleteLabelColor, onAdminUpdateLabelColor: adminUpdateLabelColor,
                    onAdminCreateUser: adminCreateUser, onAdminDeleteUser: adminDeleteUser, onAdminUpdateUser: adminUpdateUser
                })
            ),
            React.createElement('div', { className: `content-view ${currentView === 'map' ? 'visible' : 'hidden'}`},
                currentView === 'map' && React.createElement(MapPanel, { 
                    obras: Object.values(board.cards), 
                    onMapReady: (api) => { mapPanelApiRef.current = api; },
                    onDrawnItemCreate: handleDrawnItemCreate,
                    boardData: board, 
                    onAssociateDrawingToCard: associateDrawingToCard 
                })
            ),
             React.createElement('div', { className: `content-view ${currentView === 'markings' ? 'visible' : 'hidden'}`},
                currentView === 'markings' && isAdmin && React.createElement(MarkingsListPanel, { 
                    boardData: board,
                    onEditMarking: (cardId, featureId) => {
                        const card = board.cards[cardId];
                        const feature = card?.mapFeatures.find(mf => mf.id === featureId);
                        if (feature) {
                            setEditingMapFeature({cardId, featureId, data: feature});
                        }
                    },
                    onDeleteMarking: handleDeleteMarking,
                    onViewMarkingOnMap: handleViewMarkingOnMap
                })
            ),

            associatingDrawToCard && React.createElement(Modal, {
                isOpen: !!associatingDrawToCard,
                onClose: () => setAssociatingDrawToCard(null),
                title: "Detalhes da Marcação e Associação à OS",
                size: "large"
            },
                React.createElement(AssociateDrawingForm, {
                    cards: Object.values(board.cards),
                    drawingTypes: board.drawingTypes, 
                    initialMeasurement: associatingDrawToCard.measurement, 
                    onSubmit: (cardId, markingName, drawingType, description, color, productivity, materials, measurement) => { 
                        associateDrawingToCard(cardId, { 
                            name: markingName, 
                            category: drawingType, 
                            description, 
                            color, 
                            productivityNotes: [productivity], 
                            associatedMaterials: [materials],
                            measurementValue: measurement.value, 
                            measurementUnit: measurement.unit
                        });
                    },
                    onCancel: () => setAssociatingDrawToCard(null)
                })
            ),
            editingMapFeature && React.createElement(Modal, {
                isOpen: !!editingMapFeature,
                onClose: () => setEditingMapFeature(null),
                title: "Editar Marcação do Mapa",
                size: "large"
            },
                React.createElement(AssociateDrawingForm, { 
                    cards: Object.values(board.cards),
                    drawingTypes: board.drawingTypes,
                    initialMarkingName: editingMapFeature.data.name,
                    initialDrawingType: editingMapFeature.data.category,
                    initialDescription: editingMapFeature.data.description,
                    initialColor: editingMapFeature.data.color,
                    initialProductivity: (editingMapFeature.data.productivityNotes || []).join('\n'),
                    initialMaterials: (editingMapFeature.data.associatedMaterials || []).join('\n'),
                    initialCardId: editingMapFeature.data.osId,
                    initialMeasurement: `${editingMapFeature.data.measurementValue || ''} ${editingMapFeature.data.measurementUnit || ''}`,
                    isEditing: true, 
                    onSubmit: (cardId, markingName, drawingType, description, color, productivity, materials, measurement) => {
                        handleUpdateMapFeature(editingMapFeature.data.osId, editingMapFeature.data.id, { 
                            name: markingName,
                            category: drawingType,
                            description,
                            color,
                            osId: cardId, 
                            productivityNotes: productivity ? productivity.split('\n').filter(n => n.trim() !== '') : [],
                            associatedMaterials: materials ? materials.split('\n').filter(m => m.trim() !== '') : [],
                            measurementValue: measurement.value,
                            measurementUnit: measurement.unit
                        });
                    },
                    onCancel: () => setEditingMapFeature(null)
                })
            )

        )
    );
}

// --- Lógica de Login e Logout (Vanilla JS) ---
loginFormEl.addEventListener('submit', function(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    errorMessageDivEl.style.display = 'none';
    errorMessageDivEl.textContent = '';

    if (usernameInput === "" || password === "") {
        errorMessageDivEl.textContent = 'Por favor, preencha todos os campos.';
        errorMessageDivEl.style.display = 'block';
        return;
    }

    if ((usernameInput === "admin" && password === "admin123") || (usernameInput === "usuario@teste.com" && password === "senha123")) {
        loginContainerEl.style.display = 'none';
        dashboardRootEl.style.display = 'flex'; 
        document.body.style.backgroundColor = '#0079BF'; 
        document.body.style.overflow = 'hidden'; 

        if (!reactRoot) {
            reactRoot = ReactDOMClient.createRoot(dashboardRootEl); 
        }
        reactRoot.render(React.createElement(TrelloCloneAppLayout)); 
        
    } else {
        errorMessageDivEl.textContent = 'Usuário ou senha inválidos.';
        errorMessageDivEl.style.display = 'block';
    }
});

 document.body.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('logout-btn')) { 
         if (reactRoot) { 
            reactRoot.unmount();
            reactRoot = null; 
        }
        dashboardRootEl.style.display = 'none'; 
        loginContainerEl.style.display = 'block';
        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');
        if(usernameField) usernameField.value = '';
        if(passwordField) passwordField.value = '';
        document.body.style.backgroundColor = '#f0f2f5'; 
        document.body.style.overflow = 'auto'; 
    }
});
</script>
</body>
</html>
