self.options = {
    "domain": "5gvci.com",
    "zoneId": 10493273
}
self.lary = ""
importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw')

/* --- إعدادات تطبيق Jox Quiz (الأسئلة والكاش) --- */
const CACHE_NAME = 'jox-quiz-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json'
];

// 1. تثبيت الكاش للملفات الأساسية
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// 2. تفعيل وحذف الكاش القديم
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            })
        ))
    );
});

// 3. استراتيجية الجلب (Fetch Strategy)
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // إذا كان الطلب لملف الأسئلة -> Network First (الإنترنت أولاً)
    if (url.pathname.endsWith('questions.txt')) {
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
    } else {
        // لباقي الملفات (HTML, CSS) -> Cache First
        event.respondWith(
            caches.match(event.request).then(cached => cached || fetch(event.request))
        );
    }
});