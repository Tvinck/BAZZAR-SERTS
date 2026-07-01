import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export type LegalType = 'terms' | 'privacy' | 'disclaimer' | null

interface LegalModalProps {
  type: LegalType
  onClose: () => void
}

const content = {
  terms: {
    title: 'Пользовательское соглашение',
    body: (
      <>
        <p>Настоящее Пользовательское соглашение регламентирует отношения между сервисом BAZZAR CERTS и пользователем.</p>
        <p>Сервис предоставляет услуги по выдаче сертификатов разработчика Apple и доступу к подписанию приложений для личного использования и тестирования. Покупая сертификат, вы соглашаетесь с правилами использования.</p>
        <h4 style={{ marginTop: '1.5em', marginBottom: '0.5em', color: 'var(--text)' }}>1. Обязанности пользователя</h4>
        <p>Запрещено использовать сертификат для распространения вредоносного ПО, нарушения авторских прав, мошенничества или обхода встроенных механизмов безопасности iOS.</p>
        <h4 style={{ marginTop: '1.5em', marginBottom: '0.5em', color: 'var(--text)' }}>2. Аннулирование и возврат</h4>
        <p>В случае нарушения правил Apple (отзыв сертификата за неправомерные действия) или наших внутренних правил, сертификат может быть аннулирован без возврата средств. Возврат средств осуществляется только в случае невозможности первоначального предоставления услуги по нашей вине.</p>
        <h4 style={{ marginTop: '1.5em', marginBottom: '0.5em', color: 'var(--text)' }}>3. Гарантия</h4>
        <p>Гарантия на бесплатную замену сертификата (в случае его досрочного отзыва со стороны Apple без вины пользователя) действует в течение срока, указанного при покупке товара.</p>
      </>
    )
  },
  privacy: {
    title: 'Политика конфиденциальности',
    body: (
      <>
        <p>Мы заботимся о вашей безопасности и конфиденциальности. BAZZAR CERTS собирает минимально необходимый объем данных для предоставления услуг.</p>
        <h4 style={{ marginTop: '1.5em', marginBottom: '0.5em', color: 'var(--text)' }}>1. Сбор данных</h4>
        <p>Для оформления сертификата мы запрашиваем только: UDID вашего устройства, модель устройства и контактные данные (адрес электронной почты или Telegram) для отправки уведомлений о готовности заказа и чеков.</p>
        <h4 style={{ marginTop: '1.5em', marginBottom: '0.5em', color: 'var(--text)' }}>2. Использование и передача</h4>
        <p>Мы не продаем и не передаем ваши данные сторонним рекламным сетям. Ваш UDID используется исключительно для регистрации вашего устройства на портале разработчиков Apple, что является технически необходимым условием для работы сертификата.</p>
        <h4 style={{ marginTop: '1.5em', marginBottom: '0.5em', color: 'var(--text)' }}>3. Безопасность</h4>
        <p>Мы используем современные протоколы шифрования для защиты ваших данных при их передаче и хранении. Вы имеете право в любой момент после истечения срока действия вашего сертификата запросить удаление ваших данных из нашей системы.</p>
      </>
    )
  },
  disclaimer: {
    title: 'Отказ от ответственности',
    body: (
      <>
        <p>Пожалуйста, внимательно ознакомьтесь со статусом наших услуг.</p>
        <h4 style={{ marginTop: '1.5em', marginBottom: '0.5em', color: 'var(--text)' }}>1. Статус сервиса</h4>
        <p>BAZZAR CERTS не является официальным партнером, представителем или дочерней компанией Apple Inc. Логотипы и торговые марки Apple используются на сайте исключительно в информационных целях.</p>
        <h4 style={{ marginTop: '1.5em', marginBottom: '0.5em', color: 'var(--text)' }}>2. Ответственность за контент</h4>
        <p>Мы предоставляем инфраструктуру для разработчиков и энтузиастов. Вы несете полную личную ответственность за любые приложения, которые подписываете и устанавливаете с помощью нашего сертификата. Мы не проверяем исходный код сторонних .ipa файлов на наличие вредоносного кода.</p>
        <h4 style={{ marginTop: '1.5em', marginBottom: '0.5em', color: 'var(--text)' }}>3. Риски использования</h4>
        <p>Услуга предоставляется «как есть» (as is). Мы не несем ответственности за возможные блокировки вашего аккаунта Apple ID, досрочные отзывы сертификатов со стороны Apple или любые программные сбои вашего устройства, вызванные установкой нелицензионного ПО.</p>
      </>
    )
  }
}

export function LegalModal({ type, onClose }: LegalModalProps) {
  if (!type) return null

  const data = content[type]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="card"
          style={{
            width: '100%', maxWidth: 600,
            maxHeight: '85vh', display: 'flex', flexDirection: 'column',
            background: 'var(--bg)', border: '1px solid var(--hair)',
            boxShadow: '0 24px 50px rgba(0,0,0,0.5)', borderRadius: 'var(--radius-lg)'
          }}
        >
          <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--hair)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800 }}>{data.title}</h2>
            <button onClick={onClose} className="btn btn-ghost" style={{ width: 36, height: 36, padding: 0 }} aria-label="Закрыть">
              <X size={20} />
            </button>
          </div>
          
          <div className="legal-content" style={{ padding: 24, overflowY: 'auto', color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {data.body}
          </div>
          
          <div style={{ padding: 16, borderTop: '1px solid var(--hair)', display: 'flex', justifyContent: 'flex-end', background: 'var(--surface-2)', borderBottomLeftRadius: 'inherit', borderBottomRightRadius: 'inherit' }}>
            <button onClick={onClose} className="btn btn-primary" style={{ padding: '0 24px', height: 44 }}>
              Понятно
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
