# Studio — arquitectura y lanzamiento
Actualizado: 2026-11-27. Estado: beta en repositorio, despliegue y ejecución en Hostinger por verificar.
## Decisiones
- Mantener PHP 8.1+, PDO SQLite, GD y HTML/CSS/JS; todo el código de Studio dentro de cross/. La DB y secretos nunca se versionan. Antes de habilitar cuentas verificar denegación HTTP de private/ y de includes/, HTTPS y copias de respaldo. Si no se puede garantizar, almacenamiento fuera de raíz web. MariaDB cuando concurrencia, latencia o operaciones lo justifiquen.
- Beta principal no sexual, adultos, alias y perfiles privados por defecto. Publicidad solo en páginas editoriales aptas tras revisión de políticas; no garantizar aprobación. Un posible servicio adulto futuro es independiente: otra infraestructura, cuenta y dominio, sin enlaces ni rastreadores compartidos; no implementado. Verificar edad y legalidad con asesoría especializada, no guardar documentos de identidad.
- HumHub/Flarum evaluables si el foro crece; no instalar una segunda identidad. Guessle requiere Node/Redis y replica Wordle, no aporta a nuestro motor. Detoxify multilingüe puede asistir moderación, nunca sustituirla; requiere runtime Python y pruebas de sesgo. Chat inicial HTTP polling PHP/SQLite con ACL por sala, no WebSockets en hosting compartido. No enviar conversaciones a terceros por defecto.
## Lanzamiento
1. Beta privada por invitación (50–100 miembros como objetivo, no garantía): validar cuentas, ABM, reportes y permisos, trivia/álbum, fichas, guías y talles. No AdSense.
2. Motor oficial: edición inmutable, temporizador y validación servidor, scoring tras cierre, historial, wallet y álbum persistentes. Primeras publicaciones en cola de moderación; denuncias y bloqueos.
3. Lanzar guías indexables con marca propia, tabla de talles por comercio/modelo y afiliados transparentes; AdSense solo si elegible. Chat general/privado tras pruebas de ACL y moderación.
4. Expandir Argentina a otras regiones mediante variantes léxicas y tablas locales; no inferir orientación ni identidad. Servicio adulto separado solo si se valida necesidad, legalidad y seguridad.
## Estimaciones de presupuesto USD, no cotización
Incremental prototipo en hosting existente: 0 si recursos incluidos. Dominio nuevo: 10–25/año como referencia genérica .com, .com.ar verificar NIC. Hosting compartido al renovar: presupuestar 10–20/mes; VPS/DB gestionada si necesario: 15–50+/mes. Backups adicionales: 0–10/mes. No incluyen impuestos, moderación humana, asesoría legal, ni verificación de edad.
## Esquema objetivo (no ejecutar migración hasta revisar)
Existentes: studio_users (alias, password_hash, nombre visible, visibilidad, avatar, activo/rol), studio_posts (muro/foro/respuestas), studio_limits, studio_demo_bots (XP ficticio), studio_meta. Propuestas:
- quiz_questions(id, prompt, category, revision, active); quiz_answers(id, question_id, canonical, active); quiz_aliases(question_id, normalized_alias, answer_id; UNIQUE question+alias). Sinónimos comparten id.
- quiz_editions(id, day UNIQUE, timezone, revision, status, closes_at); quiz_edition_questions(edition_id, position, question_id, snapshot_json; UNIQUE edition+position).
- quiz_attempts(id, user_id, edition_id, started_at, finished_at, status, score, UNIQUE user+edition); quiz_submissions(attempt_id, position, answer_id nullable, submitted_at, deadline, valid, score; UNIQUE attempt+position). No guardar texto incorrecto innecesario. Solo servidor valida reloj y respuesta.
- quiz_counts(edition_id, position, answer_id, n, UNIQUE edition+position+answer); quiz_score_jobs(edition_id UNIQUE, finalized_at, formula_revision); congelar ranking a cierre, contabilizar solo intentos elegibles de miembros reales, excluir bots y cuentas de prueba. No mostrar frecuencia de edición abierta para no facilitar trampa.
- wallet_ledger(id, user_id, delta_credits, delta_xp, reason, source_key UNIQUE, created_at); balances derivados y transacciones atómicas. albums, stickers, user_stickers, packs, pack_draws, achievements, user_achievements. No dinero real.
- post_reviews(post_id, state, reviewer_id, reason, reviewed_at); reports(id, reporter_id, target_type, target_id, category, state, created_at); user_blocks(blocker_id, blocked_id, PRIMARY KEY ambos); sanctions(id, user_id, type, until_at); audit_log con datos mínimos y retención.
- chat_rooms(id, owner_id, visibility, title, created_at); chat_members(room_id, user_id, role, joined_at, UNIQUE room+user); chat_invites(id, room_id, invited_user_id, expires_at, revoked_at); chat_messages(id, room_id, user_id, body, created_at, deleted_at); chat_read_state(room_id,user_id,last_message_id). Autorización por cada consulta. Reportar, bloquear, moderar; sin E2EE.
- size_sources(id, brand, url, country, checked_at, measure_kind, product_scope); size_rows(source_id, label, foot_cm nullable, bust_min/max, waist_min/max, hip_min/max); glossary_terms(id, term, category, definition, revision). Catálogos JSON/locales inicialmente. No persistir medidas personales.
## Rareza
Prototipo 0.6: cohorte sintética de 100 respuestas por consigna, reparto determinista por grupo canónico. Puntos = max(1, round(100/(1+n))) para respuesta válida; inválida 0. n = coincidencias en cohorte simulada; 0 => 100, 9 => 10, 49 => 2. Los puntos de prueba no afectan XP/monedas existentes ni ranking oficial. Próxima versión: al cierre, n = otros participantes elegibles con el mismo answer_id, puntuación estable para todos; umbral mínimo de 20 participantes válidos por consigna o puntos fijos provisionales de 10 para aciertos. Excluir bots y no premiar trampas por alias. Publicar distribución agregada solo una vez cerrada.
## Privacidad y moderación
Seudonimato, no anonimato absoluto frente al operador. Minimizar datos, no solicitar nombre legal, orientación, ubicación precisa, documentos o medidas corporales. Consentimiento informado, política clara de acceso/supresión, borrado y plazos de retención; asesoría argentina Ley 25.326 y obligaciones del operador. No indexar perfiles ni UGC privado; noindex no es seguridad. Prohibir doxxing, sexualización de menores, acoso, suplantación y publicación de terceros sin consentimiento. Primeros posts revisados y botón de denuncia antes de abrir beta. Sin anuncios en UGC pendiente. Revisión humana de filtros automáticos.
## Fuentes
Google: https://support.google.com/adsense/answer/10008391 y https://support.google.com/adsense/answer/10502938
AAIP: https://www.argentina.gob.ar/aaip/datospersonales/derechos
Ley: https://www.argentina.gob.ar/normativa/nacional/ley-25326-64790/texto
Guessle: https://github.com/jakerella/guessle
Detoxify: https://github.com/unitaryai/detoxify
Hostinger: https://www.hostinger.com/pricing

## Actualización 0.9
La beta incorpora código de medidas privadas, juego y álbum persistentes, chat y moderación, Memory Chic, glosario de fichas y Ropero (119 prendas y accesorios). Pendiente validar el despliegue y el circuito completo con usuarios ficticios, fortalecer moderación y publicar contenido revisado. No iniciar monetización todavía.
