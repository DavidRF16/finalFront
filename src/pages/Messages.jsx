import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import Loading from '../components/Loading';

function Messages() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [text, setText] = useState('');
  const queryClient = useQueryClient();

  // Traer todos los mensajes para extraer conversaciones únicas
  const { data: allMessages = [], isLoading } = useQuery({
    queryKey: ['all-messages'],
    queryFn: async () => {
      const { data } = await api.get('/messages/my-conversations');
      return data.data || [];
    },
  });

  // Conversación activa con el usuario seleccionado
  const { data: conversation = [], isLoading: convLoading } = useQuery({
    queryKey: ['conversation', selectedUser?._id],
    enabled: !!selectedUser,
    refetchInterval: 3000, // refresca cada 3 segundos
    queryFn: async () => {
      const { data } = await api.get(`/messages/conversation/${selectedUser._id}`);
      return data.data || [];
    },
  });

  const sendMutation = useMutation({
    mutationFn: () => api.post('/messages', { receiverId: selectedUser._id, text }),
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries(['conversation', selectedUser._id]);
      queryClient.invalidateQueries(['all-messages']);
    },
    onError: (err) => alert(err.response?.data?.message || 'Error al enviar mensaje'),
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMutation.mutate();
  };

  // Obtener token para saber quién soy yo
  const me = (() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      return JSON.parse(atob(token.split('.')[1]));
    } catch { return null; }
  })();

  if (isLoading) return <Loading />;

  return (
    <div style={{ display: 'flex', gap: '1.5rem', height: '75vh' }}>

      {/* Lista de conversaciones */}
      <div style={{ width: '280px', flexShrink: 0, backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.1rem' }}>💬 Conversaciones</h2>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {allMessages.length === 0 ? (
            <p style={{ padding: '1.5rem', color: '#6b7280', fontSize: '0.875rem', textAlign: 'center' }}>
              No tienes conversaciones aún
            </p>
          ) : (
            allMessages.map((contact) => (
              <button
                key={contact._id}
                onClick={() => setSelectedUser(contact)}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  textAlign: 'left',
                  border: 'none',
                  borderBottom: '1px solid #f3f4f6',
                  backgroundColor: selectedUser?._id === contact._id ? '#ede9fe' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0 }}>
                  {contact.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '0.9rem' }}>{contact.username}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selectedUser ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</p>
              <p style={{ fontSize: '1.1rem' }}>Selecciona una conversación</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header del chat */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                {selectedUser.username?.[0]?.toUpperCase()}
              </div>
              <h3 style={{ fontWeight: 'bold', color: '#111827' }}>{selectedUser.username}</h3>
            </div>

            {/* Mensajes */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {convLoading ? <Loading /> : conversation.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9ca3af' }}>No hay mensajes aún</p>
              ) : (
                conversation.map((msg) => {
                  const isMe = msg.sender?._id === me?.id || msg.sender === me?.id;
                  return (
                    <div key={msg._id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '65%',
                        padding: '0.6rem 1rem',
                        borderRadius: isMe ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                        backgroundColor: isMe ? '#7c3aed' : '#f3f4f6',
                        color: isMe ? 'white' : '#111827',
                        fontSize: '0.9rem',
                        lineHeight: '1.4',
                      }}>
                        {msg.product && (
                          <p style={{ fontSize: '0.75rem', opacity: 0.75, marginBottom: '0.25rem' }}>
                            📦 {msg.product?.title}
                          </p>
                        )}
                        <p>{msg.text}</p>
                        <p style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.25rem', textAlign: 'right' }}>
                          {new Date(msg.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '0.75rem' }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribe un mensaje..."
                style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '9999px', outline: 'none', fontSize: '0.9rem' }}
              />
              <button
                type="submit"
                disabled={sendMutation.isPending || !text.trim()}
                style={{ padding: '0.75rem 1.25rem', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '9999px', cursor: 'pointer', fontWeight: 'bold', opacity: sendMutation.isPending || !text.trim() ? 0.5 : 1 }}
              >
                Enviar
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Messages;