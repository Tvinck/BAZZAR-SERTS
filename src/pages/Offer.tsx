import { usePageTitle } from '../hooks/usePageTitle'

/* Публичная оферта + условия возврата/гарантии + реквизиты.
   ВНИМАНИЕ: значения в [квадратных скобках] нужно заполнить реальными данными
   продавца (ИП/юрлицо). Это шаблон — при необходимости согласуйте с юристом. */

const SELLER = {
  name: 'ИП Кошелев Артём Николаевич',
  ogrnip: 'ОГРНИП: 325330000066143',
  inn: 'ИНН: 331110148785',
  address: 'Владимирская область, Александровский район, г. Карабаново',
  email: 'support@bazzar-certs.shop',
  telegram: 'https://t.me/bazzarcerts',
  site: 'https://bazzar-serts.shop',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 'var(--sp-6)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{title}</h2>
      <div style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.7 }}>{children}</div>
    </section>
  )
}

export function Offer() {
  usePageTitle('Оферта, возврат и реквизиты')

  return (
    <div className="container" style={{ maxWidth: 820, padding: 'var(--sp-8) 0 var(--sp-10)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
        Публичная оферта
      </h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 'var(--sp-6)' }}>
        Редакция от {new Date().toLocaleDateString('ru-RU')}. Настоящий документ является публичной офертой (ст. 435, 437 ГК РФ).
      </p>

      <Section title="1. Общие положения">
        Продавец: {SELLER.name}, {SELLER.ogrnip}, {SELLER.inn}. Оформляя заказ и производя оплату на сайте {SELLER.site},
        покупатель подтверждает согласие с условиями настоящей оферты, политикой конфиденциальности и условиями возврата.
      </Section>

      <Section title="2. Предмет">
        Продавец предоставляет цифровую услугу — регистрацию UDID устройства покупателя в сертификате разработчика Apple
        (и/или доступ к приложениям) в объёме выбранного тарифа. Услуга носит нематериальный характер.
      </Section>

      <Section title="3. Цена и оплата">
        Стоимость указана на странице товара в рублях РФ. Оплата производится онлайн через платёжный сервис (эквайринг Т‑Банк).
        Обязательство по оплате считается исполненным с момента подтверждения платежа банком. Кассовый чек (54‑ФЗ)
        направляется на указанный покупателем email.
      </Section>

      <Section title="4. Порядок оказания услуги">
        После оплаты и получения UDID устройства продавец регистрирует сертификат в срок до 24 часов. Статус заказа доступен
        в личном кабинете на сайте. Для получения услуги покупатель обязан предоставить корректный UDID своего устройства.
      </Section>

      <Section title="5. Возврат и гарантия замены">
        Поскольку услуга является цифровой и оказывается сразу после оплаты, возврат средств за надлежаще оказанную услугу
        не производится (ст. 26.1 Закона «О защите прав потребителей» и Постановление Правительства РФ, цифровой контент).
        Продавец предоставляет <b>гарантию замены сертификата</b> в течение срока тарифа: при аннулировании/отзыве сертификата
        не по вине покупателя — бесплатная перерегистрация. Если услуга не может быть оказана по вине продавца — производится
        полный возврат на способ оплаты в течение 10 рабочих дней.
      </Section>

      <Section title="6. Ответственность">
        Продавец не несёт ответственности за работоспособность стороннего ПО, действия Apple, а также за последствия
        нарушения покупателем условий использования устройства. Покупатель самостоятельно оценивает риски установки
        стороннего ПО.
      </Section>

      <Section title="7. Реквизиты продавца">
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 'var(--sp-4)' }}>
          <div>{SELLER.name}</div>
          <div>{SELLER.ogrnip}</div>
          <div>{SELLER.inn}</div>
          <div>{SELLER.address}</div>
          <div>Email: <a href={`mailto:${SELLER.email}`} style={{ color: 'var(--accent)' }}>{SELLER.email}</a></div>
          <div>Telegram: <a href={SELLER.telegram} target="_blank" rel="noopener" style={{ color: 'var(--accent)' }}>@bazzarcerts</a></div>
        </div>
      </Section>
    </div>
  )
}
