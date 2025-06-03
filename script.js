// script.js - Lógica da Aplicação (React com Supabase)

const { useState, useEffect, useRef } = React;
const { createRoot } = ReactDOM;

function App() { // Não recebe mais props de URL/Key diretamente no App
    // Adicionado para depuração: verifica o estado inicial do supabase
    console.log("App component rendered. Current supabase state:", supabase);

    const [supabase, setSupabase] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const messagesEndRef = useRef(null);

    // Efeito para inicializar o cliente Supabase no estado do React
    // Este useEffect garante que o cliente Supabase seja pego da variável global APENAS UMA VEZ
    useEffect(() => {
        // Acessa o cliente Supabase que já deve estar disponível globalmente
        const supabaseClient = window.supabase;
        
        if (supabaseClient && !supabase) { // Se o cliente global existe e ainda não está no estado
            setSupabase(supabaseClient);
            console.log("Supabase client set in React state from global.");
        } else if (!supabaseClient) {
            console.log("window.supabase is not yet available in React useEffect.");
            // Se chegar aqui, algo está errado com o carregamento da biblioteca Supabase ou sua inicialização global.
            // A tela pode continuar "Carregando autenticação..." se o cliente não for inicializado.
            // Em um ambiente de produção, você pode querer um fallback ou um erro mais visível.
        }
    }, []); // Dependência vazia para rodar apenas uma vez na montagem do componente

    // Efeito para configurar o listener de autenticação e buscar dados INICIALMENTE
    // Este useEffect só deve rodar quando o cliente Supabase estiver pronto no estado.
    useEffect(() => {
        if (!supabase) {
            console.log("Supabase client not ready for auth listener and data fetching.");
            return;
        }

        // Listener de mudança de estado de autenticação do Supabase
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const user = session.user;
                setUserId(user.id);

                // Busca o perfil do usuário na tabela 'users'
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('display_name, is_admin')
                    .eq('id', user.id)
                    .single();

                if (userError && userError.code === 'PGRST116') { // No rows found
                    // Se o perfil não existir, cria um novo (primeiro login ou registro via admin)
                    console.log("Perfil de usuário não encontrado, criando...");
                    const { data: newUserData, error: createError } = await supabase
                        .from('users')
                        .insert({
                            id: user.id,
                            display_name: user.email, // Temporário, será atualizado no registro
                            is_admin: false, // Padrão
                        })
                        .select('display_name, is_admin')
                        .single();

                    if (createError) {
                        console.error("Erro ao criar perfil de usuário:", createError);
                        setUserName(user.email || user.id);
                        setIsAdmin(false);
                    } else {
                        setUserName(newUserData.display_name);
                        setIsAdmin(newUserData.is_admin);
                    }
                } else if (userError) {
                    console.error("Erro ao buscar perfil de usuário:", userError);
                    setUserName(user.email || user.id);
                    setIsAdmin(false);
                } else {
                    setUserName(userData.display_name);
                    setIsAdmin(userData.is_admin);
                }

                // Atualiza last_seen
                await supabase
                    .from('users')
                    .update({ last_seen: new Date().toISOString() })
                    .eq('id', user.id);

                setIsAuthReady(true);
                console.log('Usuário autenticado:', user.id, 'Nome:', userName, 'Admin:', isAdmin);
            } else {
                setUserId(null);
                setUserName('');
                setIsAdmin(false);
                setIsAuthReady(true);
                console.log('Nenhum usuário autenticado.');
            }
        });

        return () => {
            if (authListener && authListener.unsubscribe) {
                authListener.unsubscribe();
            }
        };
    }, [supabase]); // Depende de 'supabase'

    // Efeito para buscar e ouvir mensagens e usuários em tempo real
    useEffect(() => {
        if (!supabase || !isAuthReady || !userId) {
            setMessages([]);
            setAllUsers([]);
            return;
        }

        // Listener para mensagens
        const messageSubscription = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
                // Supabase real-time payload structure
                // We need to re-fetch all messages to ensure correct ordering and filtering
                fetchMessages();
            })
            .subscribe();

        // Listener para usuários
        const userSubscription = supabase
            .channel('public:users')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, payload => {
                fetchUsers();
            })
            .subscribe();

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true }); // Order by created_at

            if (error) {
                console.error("Erro ao buscar mensagens:", error);
                showUserMessage("Erro ao carregar mensagens.");
            } else {
                setMessages(data.map(msg => ({
                    id: msg.id,
                    senderId: msg.sender_id,
                    senderName: msg.sender_name,
                    recipientId: msg.recipient_id,
                    text: msg.content,
                    timestamp: new Date(msg.created_at),
                })));
                console.log('Mensagens atualizadas:', data.length);
            }
        };

        const fetchUsers = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('id, display_name, is_admin');

            if (error) {
                console.error("Erro ao buscar usuários:", error);
                showUserMessage("Erro ao carregar lista de usuários.");
            } else {
                setAllUsers(data.map(u => ({
                    uid: u.id,
                    displayName: u.display_name,
                    isAdmin: u.is_admin
                })));
                console.log('Usuários atualizados:', data.length);
            }
        };

        // Chamadas iniciais para buscar dados
        fetchMessages();
        fetchUsers();

        return () => {
            supabase.removeChannel(messageSubscription);
            supabase.removeChannel(userSubscription);
        };
    }, [supabase, isAuthReady, userId]); // Depende de 'supabase', 'isAuthReady' e 'userId'

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const showUserMessage = (msg) => {
        setModalMessage(msg);
        setShowModal(true);
    };

    const handleRegister = async () => {
        if (!supabase || !email || !password || !displayName) {
            showUserMessage('Por favor, preencha todos os campos para registro.');
            return;
        }
        if (password.length < 6) {
            showUserMessage('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        try {
            // Register user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
            });

            if (authError) throw authError;

            const user = authData.user;

            // Check if this is the first user to register and make them admin
            const { count: userCount, error: countError } = await supabase
                .from('users')
                .select('id', { count: 'exact' });

            if (countError) throw countError;

            const isCurrentUserAdmin = userCount === 0;

            // Create user profile in 'users' table
            const { error: profileError } = await supabase
                .from('users')
                .insert({
                    id: user.id,
                    display_name: displayName,
                    is_admin: isCurrentUserAdmin,
                });

            if (profileError) throw profileError;

            showUserMessage('Registro bem-sucedido! Você está logado.');
            setEmail('');
            setPassword('');
            setDisplayName('');
            setIsRegistering(false);
        } catch (error) {
            console.error('Erro no registro:', error);
            let errorMessage = 'Erro ao registrar. Tente novamente.';
            if (error.message.includes('User already registered')) {
                errorMessage = 'Este e-mail já está em uso.';
            } else if (error.message.includes('Invalid email credentials')) {
                errorMessage = 'O formato do e-mail é inválido.';
            } else if (error.message.includes('Password should be at least 6 characters')) {
                errorMessage = 'A senha é muito fraca.';
            }
            showUserMessage(errorMessage);
        }
    };

    const handleLogin = async () => {
        if (!supabase || !email || !password) {
            showUserMessage('Por favor, preencha e-mail e senha.');
            return;
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            showUserMessage('Login bem-sucedido!');
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error('Erro no login:', error);
            let errorMessage = 'Erro ao fazer login. Verifique seu e-mail e senha.';
            if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'E-mail ou senha inválidos.';
            }
            showUserMessage(errorMessage);
        }
    };

    const handleLogout = async () => {
        if (supabase) {
            try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                showUserMessage('Você foi desconectado.');
                setUserId(null);
                setUserName('');
                setIsAdmin(false);
                setMessages([]);
                setAllUsers([]);
                setSelectedRecipient('all');
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
                showUserMessage('Erro ao fazer logout. Tente novamente.');
            }
        }
    };

    const handleCreateNewUserByAdmin = async (newEmail, newPassword, newDisplayName) => {
        if (!supabase || !newEmail || !newPassword || !newDisplayName) {
            showUserMessage('Por favor, preencha todos os campos para criar um novo usuário.');
            return false;
        }
        if (newPassword.length < 6) {
            showUserMessage('A senha do novo usuário deve ter pelo menos 6 caracteres.');
            return false;
        }

        try {
            // Create user in Supabase Auth (admin can create users without signing in as them)
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: newEmail,
                password: newPassword,
                email_confirm: true // Automatically confirm email for admin created users
            });

            if (authError) throw authError;

            const newUser = authData.user;

            // Create user profile in 'users' table
            const { error: profileError } = await supabase
                .from('users')
                .insert({
                    id: newUser.id,
                    display_name: newDisplayName,
                    is_admin: false, // New users created by admin are not admins by default
                });

            if (profileError) throw profileError;

            showUserMessage(`Usuário ${newDisplayName} criado com sucesso!`);
            return true;
        } catch (error) {
            console.error('Erro ao criar novo usuário pelo admin:', error);
            let errorMessage = 'Erro ao criar novo usuário. Tente novamente.';
            if (error.message.includes('User already registered')) {
                errorMessage = 'Este e-mail já está em uso por outro usuário.';
            } else if (error.message.includes('Invalid email credentials')) {
                errorMessage = 'O formato do e-mail é inválido.';
            } else if (error.message.includes('Password should be at least 6 characters')) {
                errorMessage = 'A senha é muito fraca.';
            }
            showUserMessage(errorMessage);
            return false;
        }
    };

    const handleSendMessage = async () => {
        if (!supabase || !userId || messageText.trim() === '') {
            showUserMessage('Por favor, digite uma mensagem.');
            return;
        }

        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    sender_id: userId,
                    sender_name: userName,
                    recipient_id: selectedRecipient === 'all' ? null : selectedRecipient,
                    content: messageText,
                });

            if (error) throw error;

            setMessageText('');
            console.log('Mensagem enviada com sucesso!');
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            showUserMessage('Erro ao enviar mensagem. Tente novamente.');
        }
    };

    const getUserDisplayName = (uid) => {
        const user = allUsers.find(u => u.uid === uid);
        return user ? user.displayName : uid;
    };

    const filteredMessages = messages.filter(msg => {
        if (selectedRecipient === 'all') {
            return msg.recipientId === null || msg.senderId === userId || msg.recipientId === userId;
        } else {
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
                onClose();
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
            );
        }

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
                            <div ref={messagesEndRef} />
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
                                        e.preventDefault();
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

    const container = document.getElementById('root');
    if (container) {
        // Renderiza o componente App
        const root = createRoot(container);
        root.render(<App />); // Não passa mais props de URL/Key, pois o cliente Supabase é global
    } else {
        console.error('Elemento com id "root" não encontrado no DOM.');
    }
    </script>
</body>
</html>
