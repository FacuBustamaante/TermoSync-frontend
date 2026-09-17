// Este archivo corre en segundo plano en el iPhone/Android y recibe los mensajes Push

self.addEventListener('push', (event) => {
    let payload = { title: 'Notificación', body: 'Nueva alerta.' };
    
    if (event.data) {
        payload = event.data.json();
    }
    
    const options = {
        body: payload.body,
        icon: payload.icon || '/apple-touch-icon.png',
        badge: '/apple-touch-icon.png', // Icono chiquito para la barra de estado
        vibrate: [200, 100, 200, 100, 200, 100, 200], // Patrón de vibración agresivo para alertas
        requireInteraction: true // Evita que la notificación desaparezca sola (ideal para alertas)
    };
    
    event.waitUntil(
        self.registration.showNotification(payload.title, options)
    );
});

// Cuando el usuario toca la notificación, abrimos la app
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then( windowClients => {
            // Si la app ya está abierta, la ponemos en primer plano
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url.indexOf(self.registration.scope) !== -1 && 'focus' in client) {
                    return client.focus();
                }
            }
            // Si estaba cerrada, la abrimos
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});