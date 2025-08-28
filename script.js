// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDaAIuIIQRKj2MFjA6KKnRbZxd106GC0A4",
  authDomain: "testmsg-9bc0b.firebaseapp.com",
  projectId: "testmsg-9bc0b",
  storageBucket: "testmsg-9bc0b.firebasestorage.app",
  messagingSenderId: "207775061836",
  appId: "1:207775061836:web:9f3c4ce3c43f2f5115a1e9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// 4. Pega uma referência para o serviço Firestore
const db = firebase.firestore();

// Lista de usuários (agora é só para a tela de login frontend)
const USUARIOS = {
    "joaopedro": "123",
    "rikelme": "123",
    "rycharlison": "123",
    "gabriel": "123",
    "marcos": "123",
    "henrique": "123"
};

// Estado do usuário
let estadoUsuario = {
    usuarioAtual: null
};

// 5. Referência para a coleção "mensagens" no Firestore.
// Tudo que for salvo aqui vai ser compartilhado com todos.
const mensagensRef = db.collection("mensagens");

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    verificarLogin();
    
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            enviarMensagem();
        }
    });
    // Comentei o handler de arquivo por enquanto
    // document.getElementById('file-input').addEventListener('change', handleFileUpload);
});

// --- FUNÇÕES DE LOGIN --- //
// Essas não mudam muito, pois o login ainda é local/frontend
function verificarLogin() {
    const usuario = sessionStorage.getItem('usuarioDopamina');
    if (usuario && USUARIOS[usuario]) {
        estadoUsuario.usuarioAtual = usuario;
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        document.getElementById('current-user').textContent = usuario;
        
        // 6. TROCAMOS AQUI: Em vez de iniciar um intervalo, iniciamos a ESCUTA em tempo real.
        iniciarEscutaTempoReal();
    } else {
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('app-container').style.display = 'none';
    }
}

function fazerLogin() {
    const usuarioSelect = document.getElementById('user-select');
    const passwordInput = document.getElementById('password-input');
    const usuario = usuarioSelect.value;
    const senha = passwordInput.value;

    if (!usuario) {
        document.getElementById('login-status').textContent = "Selecione um usuário!";
        return;
    }

    if (USUARIOS[usuario] === senha) {
        sessionStorage.setItem('usuarioDopamina', usuario);
        estadoUsuario.usuarioAtual = usuario;
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        document.getElementById('current-user').textContent = usuario;
        
        // 7. TROCAMOS AQUI TAMBÉM.
        iniciarEscutaTempoReal();
    } else {
        document.getElementById('login-status').textContent = "Senha incorreta!";
    }
}

function sair() {
    sessionStorage.removeItem('usuarioDopamina');
    location.reload();
}

// --- FUNÇÕES DO CHAT - TOTALMENTE REFEITAS --- //

// 8. A MÁGIA ACONTECE AQUI: Esta função fica "escutando" o banco de dados.
// Sempre que uma nova mensagem é adicionada, ela automaticamente atualiza a tela de TODO MUNDO.
function iniciarEscutaTempoReal() {
    mensagensRef.orderBy("timestamp", "asc").onSnapshot((snapshot) => {
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = ''; // Limpa a tela

        // Itera por cada documento (mensagem) no banco
        snapshot.forEach((doc) => {
            const msg = doc.data(); // Pega os dados da mensagem
            mostrarMensagemNaTela(msg);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, (error) => { // Tratamento de erro básico
        console.error("Erro ao escutar mensagens:", error);
    });
}

// 9. Função auxiliar para colocar a mensagem na tela
function mostrarMensagemNaTela(msg) {
    const chatMessages = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'chat-message';

    // Converte o timestamp do Firebase para uma hora legível
    let tempoLegivel = "Agora mesmo";
    if (msg.timestamp) {
        tempoLegivel = msg.timestamp.toDate().toLocaleTimeString();
    }

    div.innerHTML = `
        <div>
            <span class="sender">${msg.usuario}:</span> 
            <span class="time">${tempoLegivel}</span>
        </div> 
        <div>${msg.texto}</div>
        ${msg.imagem ? `<img class="chat-image" src="${msg.imagem}" alt="Imagem">` : ''} 
        ${msg.audio ? `<audio class="chat-audio" controls src="${msg.audio}"></audio>` : ''}
    `;
    chatMessages.appendChild(div);
}

// 10. FUNÇÃO ENVIAR MENSAGEM: Agora salva no Firebase, não no localStorage!
function enviarMensagem() {
    const input = document.getElementById('chat-input');
    const texto = input.value.trim();
    
    if (!texto) return; // Não envia mensagem vazia

    // 11. Cria um objeto com os dados da mensagem
    const novaMensagem = {
        usuario: estadoUsuario.usuarioAtual,
        texto: texto,
        timestamp: firebase.firestore.FieldValue.serverTimestamp() // Usa a hora EXATA do servidor
    };

    // 12. ADICIONA a mensagem na coleção "mensagens" do Firestore
    mensagensRef.add(novaMensagem)
        .then(() => {
            // Sucesso! A mensagem foi para o banco.
            // A função `iniciarEscutaTempoReal()` vai detectar automaticamente e atualizar a tela.
            input.value = ''; // Limpa o campo de input
        })
        .catch((error) => {
            // Algo deu errado. Mostra um alerta.
            console.error("Erro ao enviar mensagem: ", error);
            alert("Erro ao enviar mensagem! Veja o console.");
        });
}

// 13. Função de upload de arquivo desabilitada por enquanto.
function handleFileUpload(e) {
    alert("Upload de arquivo será implementado na próxima versão! Use apenas texto por enquanto.");
    e.target.value = '';
}