// Importações da SDK Modular (v9)
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, orderBy, serverTimestamp, query } from 'firebase/firestore';

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
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Lista de usuários
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

// Referência para a coleção "mensagens"
const mensagensRef = collection(db, "mensagens");

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    verificarLogin();
    
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            enviarMensagem();
        }
    });
});

// --- FUNÇÕES DE LOGIN --- //
function verificarLogin() {
    const usuario = sessionStorage.getItem('usuarioDopamina');
    if (usuario && USUARIOS[usuario]) {
        estadoUsuario.usuarioAtual = usuario;
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        document.getElementById('current-user').textContent = usuario;
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
        iniciarEscutaTempoReal();
    } else {
        document.getElementById('login-status').textContent = "Senha incorreta!";
    }
}

function sair() {
    sessionStorage.removeItem('usuarioDopamina');
    location.reload();
}

// --- FUNÇÕES DO CHAT --- //
function iniciarEscutaTempoReal() {
    // Cria uma query ordenada por timestamp
    const q = query(mensagensRef, orderBy("timestamp", "asc"));
    
    // Fica escutando em tempo real
    onSnapshot(q, (snapshot) => {
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = '';

        snapshot.forEach((doc) => {
            const msg = doc.data();
            mostrarMensagemNaTela(msg);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, (error) => {
        console.error("Erro ao escutar mensagens:", error);
    });
}

function mostrarMensagemNaTela(msg) {
    const chatMessages = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'chat-message';

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
    `;
    chatMessages.appendChild(div);
}

async function enviarMensagem() {
    const input = document.getElementById('chat-input');
    const texto = input.value.trim();
    
    if (!texto) return;

    try {
        // Adiciona um novo documento com um ID gerado automaticamente
        await addDoc(mensagensRef, {
            usuario: estadoUsuario.usuarioAtual,
            texto: texto,
            timestamp: serverTimestamp() // Usa a função serverTimestamp da v9
        });
        input.value = '';
    } catch (error) {
        console.error("Erro ao enviar mensagem: ", error);
        alert("Erro ao enviar mensagem!");
    }
}

function handleFileUpload(e) {
    alert("Upload de arquivo desabilitado.");
    e.target.value = '';
}
