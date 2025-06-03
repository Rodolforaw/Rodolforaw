// script.js - Lógica da Aplicação (React)

// Certifique-se de que React e ReactDOM estão disponíveis globalmente
const { useState, useEffect, useRef } = React;
const { createRoot } = ReactDOM; // Usar createRoot para React 18

// Componente principal da aplicação
function App() {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState(''); // Display name for the current user
    const [isAdmin, setIsAdmin] = useState(false); // New state for admin status
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState([]);
    const [allUsers, setAllUsers] = useState([]); // List of all authenticated users {uid, displayName}
    const [selectedRecipient, setSelectedRecipient] = useState('all'); // 'all' or a specific userId
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState(''); // For registration
    const [isRegistering, setIsRegistering] = useState(false); // To toggle between login/register forms
    const [showAdminPanel, setShowAdminPanel] = useState(false); // New state to show/hide admin panel
    const messagesEndRef = useRef(null);

    // Efeito para inicializar Firebase e configurar o listener de autenticação
    useEffect(() => {
        // Acessa as variáveis globais definidas no index.html
        const firebaseApp = window.firebaseApp;
        const firebaseDb = window.firebaseDb;
        const firebaseAuth = window.firebaseAuth;
        const firebaseInitialAuthToken = window.firebaseInitialAuthToken;
        const firebaseAppId = window.firebaseAppId;

        // Access globally exposed functions
        const signInAnonymouslyGlobal = window.signInAnonymously;
        const signInWithCustomTokenGlobal = window.signInWithCustomToken;
        const onAuthStateChangedGlobal = window.onAuthStateChanged;
        const createUserWithEmailAndPasswordGlobal = window.createUserWithEmailAndPassword;
        const signInWithEmailAndPasswordGlobal = window.signInWithEmailAndPassword;
        const signOutGlobal = window.signOut;
        const serverTimestampGlobal = window.serverTimestamp;
        const collectionGlobal = window.collection;
        const docGlobal = window.doc;
        const getDocGlobal = window.getDoc;
        const setDocGlobal = window.setDoc;
        const addDocGlobal = window.addDoc;
        const queryGlobal = window.query;
        const orderByGlobal = window.orderBy;
        const onSnapshotGlobal = window.onSnapshot;

        if (firebaseApp && firebaseDb && firebaseAuth) {
            setDb(firebaseDb);
            setAuth(firebaseAuth);

            // Listener de mudança de estado de autenticação
            const unsubscribe = onAuthStateChangedGlobal(firebaseAuth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    // Fetch user's display name from Firestore
                    const userDocRef = docGlobal(collectionGlobal(firebaseDb, `/artifacts/${firebaseAppId}/public/data/users`), user.uid);
                    try {
                        const docSnap = await getDocGlobal(userDocRef);
                        if (docSnap.exists()) {
                            const userData = docSnap.data();
                            setUserName(userData.displayName || user.email || user.uid);
                            setIsAdmin(userData.isAdmin || false); // Set isAdmin status
                            await setDocGlobal(userDocRef, {
                                lastSeen: serverTimestampGlobal(),
                            }, { merge: true });
                        } else {
                            // If user exists in Auth but not in Firestore (e.g., first login after anonymous)
                            // Or if displayName is not set yet for email/password users
                            const nameToSet = user.displayName || user.email || user.uid;
                            setUserName(nameToSet);

                            // Check if this is the first user to register and make them admin
                            const adminSettingsDocRef = docGlobal(firebaseDb, `/artifacts/${firebaseAppId}/public/data/settings/admin`);
                            const adminSettingsSnap = await getDocGlobal(adminSettingsDocRef);
                            let isCurrentUserAdmin = false;

                            if (!adminSettingsSnap.exists()) {
                                // First user to register becomes admin
                                await setDocGlobal(adminSettingsDocRef, { adminId: user.uid });
                                isCurrentUserAdmin = true;
                                console.log(`Usuário ${user.uid} definido como administrador.`);
                            } else {
                                isCurrentUserAdmin = (adminSettingsSnap.data().adminId === user.uid);
                            }
                            setIsAdmin(isCurrentUserAdmin);

                            await setDocGlobal(userDocRef, {
                                displayName: nameToSet,
                                lastSeen: serverTimestampGlobal(),
                                createdAt: serverTimestampGlobal(),
                                isAdmin: isCurrentUserAdmin, // Store admin status in user doc
                            });
                        }
                    } catch (error) {
                        console.error("Erro ao buscar/atualizar nome de exibição do usuário ou status de admin:", error);
                        setUserName(user.email || user.uid); // Fallback to email or uid
                        setIsAdmin(false); // Assume not admin on error
                    }
                    setIsAuthReady(true);
                    console.log('Usuário autenticado:', user.uid, 'Nome:', userName, 'Admin:', isAdmin);
                } else {
                    setUserId(null);
                    setUserName('');
                    setIsAdmin(false); // Reset admin status on logout
                    setIsAuthReady(true); // Still ready, but not authenticated
                    console.log('Nenhum usuário autenticado.');
                }
            });

            return () => unsubscribe(); // Limpa o listener ao desmontar o componente
        }
    }, []);

    // Efeito para buscar e ouvir mensagens e usuários
    useEffect(() => {
        if (!db || !isAuthReady || !userId) {
            // Only fetch messages and users if authenticated
            setMessages([]); // Clear messages if not authenticated
            setAllUsers([]); // Clear users if not authenticated
            return;
        }

        const appId = window.firebaseAppId;
        const collectionGlobal = window.collection;
        const queryGlobal = window.query;
        const orderByGlobal = window.orderBy;
        const onSnapshotGlobal = window.onSnapshot;
        const docGlobal = window.doc;
        const getDocGlobal = window.getDoc;

        // Listener para mensagens
        const messagesCollectionRef = collectionGlobal(db, `/artifacts/${appId}/public/data/messages`);
        const qMessages = queryGlobal(messagesCollectionRef, orderByGlobal('timestamp', 'asc'));

        const unsubscribeMessages = onSnapshotGlobal(
            qMessages,
            (snapshot) => {
                const fetchedMessages = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : new Date(),
                }));
                setMessages(fetchedMessages);
                console.log('Mensagens atualizadas:', fetchedMessages.length);
            },
            (error) => {
                console.error("Erro ao buscar mensagens:", error);
                showUserMessage("Erro ao carregar mensagens.");
            }
        );

        // Listener para usuários
        const usersCollectionRef = collectionGlobal(db, `/artifacts/${appId}/public/data/users`);
        const unsubscribeUsers = onSnapshotGlobal(
            usersCollectionRef,
            (snapshot) => {
                const fetchedUsers = snapshot.docs.map(doc => ({
                    uid: doc.id,
                    displayName: doc.data().displayName || doc.id, // Use displayName or fallback to uid
                    isAdmin: doc.data().isAdmin || false // Fetch admin status for all users
                }));
                setAllUsers(fetchedUsers);
                console.log('Usuários atualizados:', fetchedUsers);
            },
            (error) => {
                console.error("Erro ao buscar usuários:", error);
                showUserMessage("Erro ao carregar lista de usuários.");
            }
        );

        return () => {
            unsubscribeMessages();
            unsubscribeUsers();
        }; // Limpa listeners ao desmontar
    }, [db, isAuthReady, userId]); // Depend on userId to re-run when auth state changes

    // Scroll para o final das mensagens quando elas são atualizadas
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Função para exibir mensagens ao usuário via modal
    const showUserMessage = (msg) => {
        setModalMessage(msg);
        setShowModal(true);
    };

    // Handle User Registration
    const handleRegister = async () => {
        if (!auth || !email || !password || !displayName) {
            showUserMessage('Por favor, preencha todos os campos para registro.');
            return;
        }
        if (password.length < 6) {
            showUserMessage('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        const createUserWithEmailAndPasswordGlobal = window.createUserWithEmailAndPassword;
        const setDocGlobal = window.setDoc;
        const collectionGlobal = window.collection;
        const docGlobal = window.doc;
        const serverTimestampGlobal = window.serverTimestamp;
        const appId = window.firebaseAppId;
        const getDocGlobal = window.getDoc;

        try {
            const userCredential = await createUserWithEmailAndPasswordGlobal(auth, email, password);
            const user = userCredential.user;

            // Check if this is the first user to register and make them admin
            const adminSettingsDocRef = docGlobal(db, `/artifacts/${appId}/public/data/settings/admin`);
            const adminSettingsSnap = await getDocGlobal(adminSettingsDocRef);
            let isCurrentUserAdmin = false;

            if (!adminSettingsSnap.exists()) {
                // First user to register becomes admin
                await setDocGlobal(adminSettingsDocRef, { adminId: user.uid });
                isCurrentUserAdmin = true;
                console.log(`Usuário ${user.uid} definido como administrador.`);
            } else {
                isCurrentUserAdmin = (adminSettingsSnap.data().adminId === user.uid);
            }

            // Store user's display name and admin status in Firestore
            const userDocRef = docGlobal(collectionGlobal(db, `/artifacts/${appId}/public/data/users`), user.uid);
            await setDocGlobal(userDocRef, {
                displayName: displayName,
                lastSeen: serverTimestampGlobal(),
                createdAt: serverTimestampGlobal(),
                isAdmin: isCurrentUserAdmin,
            });
            showUserMessage('Registro bem-sucedido! Você está logado.');
            setEmail('');
            setPassword('');
            setDisplayName('');
            setIsRegistering(false); // Switch to login view or main app
        } catch (error) {
            console.error('Erro no registro:', error);
            let errorMessage = 'Erro ao registrar. Tente novamente.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Este e-mail já está em uso.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'O formato do e-mail é inválido.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'A senha é muito fraca.';
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMessage = 'Registro por e-mail/senha não está ativado. Por favor, ative-o nas configurações do Firebase Authentication.';
            }
            showUserMessage(errorMessage);
        }
    };

    // Handle User Login
    const handleLogin = async () => {
        if (!auth || !email || !password) {
            showUserMessage('Por favor, preencha e-mail e senha.');
            return;
        }

        const signInWithEmailAndPasswordGlobal = window.signInWithEmailAndPassword;

        try {
            await signInWithEmailAndPasswordGlobal(auth, email, password);
            showUserMessage('Login bem-sucedido!');
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error('Erro no login:', error);
            let errorMessage = 'Erro ao fazer login. Verifique seu e-mail e senha.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = 'E-mail ou senha inválidos.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'O formato do e-mail é inválido.';
            }
            showUserMessage(errorMessage);
        }
    };

    // Handle User Logout
    const handleLogout = async () => {
        const signOutGlobal = window.signOut;
        if (auth) {
            try {
                await signOutGlobal(auth);
                showUserMessage('Você foi desconectado.');
                setUserId(null);
                setUserName('');
                setIsAdmin(false); // Reset admin status
                setMessages([]); // Clear messages on logout
                setAllUsers([]); // Clear users on logout
                setSelectedRecipient('all'); // Reset recipient
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
                showUserMessage('Erro ao fazer logout. Tente novamente.');
            }
        }
    };

    // Handle Admin creating a new user
    const handleCreateNewUserByAdmin = async (newEmail, newPassword, newDisplayName) => {
        if (!auth || !newEmail || !newPassword || !newDisplayName) {
            showUserMessage('Por favor, preencha todos os campos para criar um novo usuário.');
            return false;
        }
        if (newPassword.length < 6) {
            showUserMessage('A senha do novo usuário deve ter pelo menos 6 caracteres.');
            return false;
        }

        const createUserWithEmailAndPasswordGlobal = window.createUserWithEmailAndPassword;
        const setDocGlobal = window.setDoc;
        const collectionGlobal = window.collection;
        const docGlobal = window.doc;
        const serverTimestampGlobal = window.serverTimestamp;
        const appId = window.firebaseAppId;

        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPasswordGlobal(auth, newEmail, newPassword);
            const newUser = userCredential.user;

            // Store new user's display name in Firestore
            const newUserDocRef = docGlobal(collectionGlobal(db, `/artifacts/${appId}/public/data/users`), newUser.uid);
            await setDocGlobal(newUserDocRef, {
                displayName: newDisplayName,
                lastSeen: serverTimestampGlobal(),
                createdAt: serverTimestampGlobal(),
                isAdmin: false, // New users created by admin are not admins by default
            });
            showUserMessage(`Usuário ${newDisplayName} criado com sucesso!`);
            return true; // Indicate success
        } catch (error) {
            console.error('Erro ao criar novo usuário pelo admin:', error);
            let errorMessage = 'Erro ao criar novo usuário. Tente novamente.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Este e-mail já está em uso por outro usuário.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'O formato do e-mail é inválido.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'A senha é muito fraca.';
            }
            showUserMessage(errorMessage);
            return false; // Indicate failure
        }
    };


    // Enviar mensagem
    const handleSendMessage = async () => {
        if (!db || !userId || messageText.trim() === '') {
            showUserMessage('Por favor, digite uma mensagem.');
            return;
        }

        const appId = window.firebaseAppId;
        const collectionGlobal = window.collection;
        const addDocGlobal = window.addDoc;
        const serverTimestampGlobal = window.serverTimestamp;

        // Usando `collection` e `addDoc` do Firestore v9
        const messagesCollectionRef = collectionGlobal(db, `/artifacts/${appId}/public/data/messages`);

        try {
            await addDocGlobal(messagesCollectionRef, {
                senderId: userId,
                senderName: userName, // Store sender's display name
                recipientId: selectedRecipient === 'all' ? null : selectedRecipient, // null for all team
                text: messageText,
                timestamp: serverTimestampGlobal(), // Use server timestamp
            });
            setMessageText(''); // Limpa o campo de texto
            console.log('Mensagem enviada com sucesso!');
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            showUserMessage('Erro ao enviar mensagem. Tente novamente.');
        }
    };

    // Helper to get display name from UID
    const getUserDisplayName = (uid) => {
        const user = allUsers.find(u => u.uid === uid);
        return user ? user.displayName : uid; // Fallback to UID if name not found
    };

    // Filtrar mensagens para exibição
    const filteredMessages = messages.filter(msg => {
        if (selectedRecipient === 'all') {
            // Show messages sent to 'all' or to/from the current user
            return msg.recipientId === null || msg.senderId === userId || msg.recipientId === userId;
        } else {
            // Show messages specifically between current user and selected recipient
            return (msg.senderId === userId && msg.recipientId === selectedRecipient) ||
                   (msg.senderId === selectedRecipient && msg.recipientId === userId);
        }
    });

    if (!isAuthReady) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-gray-100">
                <div className="text-center text-gray-600 text-lg">
                    Carregando autenticação...
                </div>
            </div>
        );
    }

    // Render login/registration forms if not authenticated
    if (!userId) {
        return (
            <div className="flex flex-col items-center justify-center h-[90vh] w-full max-w-md bg-white rounded-lg shadow-xl p-8">
                <h2 className="text-3xl font-bold text-blue-700 mb-6">
                    {isRegistering ? 'Registrar Nova Conta' : 'Entrar'}
                </h2>
                {isRegistering && (
                    <input
                        type="text"
                        className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Seu Nome de Exibição"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />
                )}
                <input
                    type="email"
                    className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Senha (mín. 6 caracteres)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {isRegistering ? (
                    <button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        onClick={handleRegister}
                    >
                        Registrar
                    </button>
                ) : (
                    <button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        onClick={handleLogin}
                    >
                        Entrar
                    </button>
                )}
                <button
                    className="text-blue-600 hover:underline"
                    onClick={() => setIsRegistering(!isRegistering)}
                >
                    {isRegistering ? 'Já tem uma conta? Entrar' : 'Não tem uma conta? Registrar'}
                </button>

                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                            <p className="text-gray-800 text-lg mb-4">{modalMessage}</p>
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                onClick={() => setShowModal(false)}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Admin Panel Component
    function AdminPanel({ onCreateUser, onClose, showUserMessage }) {
        const [newEmail, setNewEmail] = useState('');
        const [newPassword, setNewPassword] = useState('');
        const [newDisplayName, setNewDisplayName] = useState('');

        const handleSubmit = async () => {
            const success = await onCreateUser(newEmail, newPassword, newDisplayName);
            if (success) {
                setNewEmail('');
                setNewPassword('');
                setNewDisplayName('');
                onClose(); // Close modal on success
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                    <h3 className="text-2xl font-bold text-blue-700 mb-6">Criar Novo Usuário</h3>
                    <input
                        type="text"
                        className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nome de Exibição do Novo Usuário"
                        value={newDisplayName}
                        onChange={(e) => setNewDisplayName(e.target.value)}
                    />
                    <input
                        type="email"
                        className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="E-mail do Novo Usuário"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Senha do Novo Usuário (mín. 6 caracteres)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <div className="flex justify-end space-x-4">
                        <button
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            onClick={handleSubmit}
                        >
                            Criar Usuário
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    // Render main app if authenticated
    return (
        <div className="flex flex-col h-[90vh] w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-t-lg shadow-md flex justify-between items-center">
                <h1 className="text-2xl font-bold">Controle de Obras</h1>
                <div className="flex items-center space-x-3">
                    {isAdmin && (
                        <button
                            className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-1 px-3 rounded-full transition-colors"
                            onClick={() => setShowAdminPanel(true)}
                        >
                            Criar Novo Membro
                        </button>
                    )}
                    <div className="text-sm bg-blue-700 px-3 py-1 rounded-full">
                        Olá, <span className="font-semibold">{userName}</span>!
                    </div>
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-1 px-3 rounded-full transition-colors"
                        onClick={handleLogout}
                    >
                        Sair
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-grow overflow-hidden">
                {/* Left Sidebar - User List */}
                <div className="w-1/4 bg-gray-50 p-4 border-r border-gray-200 overflow-y-auto">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Membros da Equipe</h2>
                    <ul className="space-y-2">
                        <li
                            className={`p-2 rounded-md cursor-pointer transition-colors duration-200 ${selectedRecipient === 'all' ? 'bg-blue-100 text-blue-800 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                            onClick={() => setSelectedRecipient('all')}
                        >
                            Toda a Equipe
                        </li>
                        {allUsers.filter(u => u.uid !== userId).map(user => (
                            <li
                                key={user.uid}
                                className={`p-2 rounded-md cursor-pointer transition-colors duration-200 ${selectedRecipient === user.uid ? 'bg-blue-100 text-blue-800 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                                onClick={() => setSelectedRecipient(user.uid)}
                            >
                                {user.displayName}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right Content - Message Area */}
                <div className="flex-grow flex flex-col bg-white">
                    {/* Message Display Area */}
                    <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-gray-50">
                        {filteredMessages.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">
                                Nenhuma mensagem para exibir. Envie a primeira!
                            </div>
                        ) : (
                            filteredMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                                            msg.senderId === userId
                                                ? 'bg-blue-500 text-white rounded-br-none'
                                                : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                        }`}
                                    >
                                        <p className="text-xs font-semibold mb-1">
                                            {msg.senderId === userId ? 'Você' : (msg.senderName || getUserDisplayName(msg.senderId))}
                                            {msg.recipientId && msg.recipientId !== userId && msg.recipientId !== null && (
                                                <span className="ml-2 text-xs opacity-80">
                                                    para {msg.recipientId === userId ? 'Você' : getUserDisplayName(msg.recipientId)}
                                                </span>
                                            )}
                                            {msg.recipientId === null && msg.senderId === userId && (
                                                <span className="ml-2 text-xs opacity-80">
                                                    para Toda Equipe
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-sm">{msg.text}</p>
                                        <p className="text-right text-xs opacity-75 mt-1">
                                            {msg.timestamp.toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} /> {/* Elemento para rolagem automática */}
                    </div>

                    {/* Message Input Area */}
                    <div className="p-4 border-t border-gray-200 bg-white flex items-center space-x-3">
                        <textarea
                            className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows="2"
                            placeholder={selectedRecipient === 'all' ? "Escreva uma mensagem para toda a equipe..." : `Escreva uma mensagem para ${getUserDisplayName(selectedRecipient)}...`}
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault(); // Previne nova linha
                                    handleSendMessage();
                                }
                            }}
                        ></textarea>
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={handleSendMessage}
                        >
                            Enviar
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Mensagens ao Usuário */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                        <p className="text-gray-800 text-lg mb-4">{modalMessage}</p>
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            onClick={() => setShowModal(false)}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            {/* Admin Panel Modal */}
            {showAdminPanel && (
                <AdminPanel
                    onCreateUser={handleCreateNewUserByAdmin}
                    onClose={() => setShowAdminPanel(false)}
                    showUserMessage={showUserMessage}
                />
            )}
        </div>
    );
}

// Renderiza o componente React na div com id="root"
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
} else {
    console.error('Elemento com id "root" não encontrado no DOM.');
}
