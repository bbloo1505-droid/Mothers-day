import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'

const PETAL_PRESETS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 7) % 92}%`,
  delay: `${(i % 9) * 0.7}s`,
  duration: `${10 + (i % 5)}s`,
  size: `${10 + (i % 4) * 4}px`,
  drift: i % 2 === 0 ? 'drift-left' : 'drift-right',
}))

const SPARKLE_PRESETS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  top: `${(i * 13) % 88}%`,
  left: `${(i * 23) % 95}%`,
  delay: `${(i % 8) * 0.4}s`,
}))

/** Edit all copy here */
const CONTENT = {
  hero: {
    title: 'Happy Mother’s Day, Anna',
    subtitle: 'A little card made with love',
    cta: 'Open your card',
  },
  letter: {
    greeting: 'Dear Anna,',
    paragraphs: [
      'Happy Mother’s Day.',
      'I’m sorry I couldn’t be with you today — I’ve been thinking of you. I hope the jet lag isn’t too rough, and that being home again feels good after such a long journey.',
      'Thank you for always supporting me and being there as I’ve grown into an adult. I really appreciate everything you’ve done for me — including having me stay with you and Dad in your new place, of course.',
      'I suppose I’ll be living at home until I’m forty now. Hopefully not, though — maybe I’ll get a job soon, haha.',
      'I can’t wait to see all the photos and hear the stories from your trip.',
    ],
    closing: 'Lots of love,',
    signature: 'Ben',
  },
  gallery: {
    title: 'Photo memories',
    subtitle: 'Moments I’m grateful we share',
  },
  finale: {
    line1: 'Love you heaps',
    line2: 'Happy Mother’s Day',
    line3: 'From Ben',
    replayCta: 'Look through the memories again',
  },
}

/** Replace files in /public/mothers-day/ — keep names or update this list */
const PHOTO_PATHS = [
  '/mothers-day/photo-1.jpg',
  '/mothers-day/photo-2.jpg',
  '/mothers-day/photo-3.jpg',
  '/mothers-day/photo-4.jpg',
  '/mothers-day/photo-5.jpg',
  '/mothers-day/photo-6.jpg',
  '/mothers-day/photo-7.jpg',
  '/mothers-day/photo-8.jpg',
  '/mothers-day/photo-9.jpg',
  '/mothers-day/photo-10.jpg',
]

/** Captions optional per slide; use empty string for none */
const GALLERY_CAPTIONS = [
  'A favourite memory',
  'Family moments',
  '',
  'Always grateful',
  '',
  'Love this one',
  '',
  'More memories to come',
  '',
  'A favourite memory',
]

/** Desktop grid slot classes; mobile stacks in DOM order */
const GALLERY_LAYOUT = [
  'slot-a',
  'slot-b',
  'slot-c',
  'slot-d',
  'slot-e',
  'slot-f',
  'slot-g',
  'slot-h',
  'slot-i',
  'slot-j',
]

const GALLERY_ITEMS = PHOTO_PATHS.map((src, i) => ({
  id: i + 1,
  src,
  alt: `Photo memory ${i + 1}`,
  caption: GALLERY_CAPTIONS[i] ?? '',
  layout: GALLERY_LAYOUT[i] ?? 'slot-default',
}))

function PetalsLayer() {
  return (
    <div className="petals" aria-hidden="true">
      {PETAL_PRESETS.map((p) => (
        <span
          key={p.id}
          className={`petal ${p.drift}`}
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: `calc(${p.size} * 1.3)`,
          }}
        />
      ))}
    </div>
  )
}

function SparklesLayer() {
  return (
    <div className="sparkles" aria-hidden="true">
      {SPARKLE_PRESETS.map((d) => (
        <span
          key={d.id}
          className="sparkle"
          style={{
            top: d.top,
            left: d.left,
            animationDelay: d.delay,
          }}
        />
      ))}
    </div>
  )
}

function useScrollReveal() {
  const [visible, setVisible] = useState(false)
  const observerRef = useRef(null)

  const attach = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
    if (!node) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true)
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    obs.observe(node)
    observerRef.current = obs
  }, [])

  useEffect(
    () => () => {
      observerRef.current?.disconnect()
      observerRef.current = null
    },
    [],
  )

  return [attach, visible]
}

function Lightbox({ index, items, onClose, onPrev, onNext }) {
  const open = index !== null
  const item = open ? items[index] : null

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose, onPrev, onNext])

  const touch = useRef({ x: 0 })

  const onTouchStart = (e) => {
    touch.current.x = e.changedTouches[0].clientX
  }
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touch.current.x
    if (dx > 56) onPrev()
    else if (dx < -56) onNext()
  }

  if (!open || !item) return null

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged photo"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button type="button" className="lightbox__backdrop" onClick={onClose} aria-label="Close" />
      <div className="lightbox__inner">
        <button type="button" className="lightbox__close" onClick={onClose} aria-label="Close">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={onPrev} aria-label="Previous photo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M14 6l-6 6 6 6" />
          </svg>
        </button>
        <figure className="lightbox__figure">
          <img src={item.src} alt={item.alt} className="lightbox__img" />
          {item.caption ? <figcaption className="lightbox__caption">{item.caption}</figcaption> : null}
        </figure>
        <button type="button" className="lightbox__nav lightbox__nav--next" onClick={onNext} aria-label="Next photo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M10 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const cardRef = useRef(null)
  const galleryRef = useRef(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const [heroAttach, heroVisible] = useScrollReveal()
  const [letterAttach, letterVisible] = useScrollReveal()
  const [galleryAttach, galleryVisible] = useScrollReveal()
  const [finaleAttach, finaleVisible] = useScrollReveal()

  const scrollToCard = () => {
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToGallery = () => {
    galleryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const openLightbox = (i) => setLightboxIndex(i)
  const closeLightbox = () => setLightboxIndex(null)

  const onPrev = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null) return i
      return i === 0 ? GALLERY_ITEMS.length - 1 : i - 1
    })
  }, [])

  const onNext = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null) return i
      return i === GALLERY_ITEMS.length - 1 ? 0 : i + 1
    })
  }, [])

  return (
    <div className="page">
      <header className={`hero ${heroVisible ? 'is-visible' : ''}`} ref={heroAttach}>
        <div className="hero__bg" />
        <PetalsLayer />
        <SparklesLayer />
        <svg className="hero__flourish hero__flourish--tl" viewBox="0 0 120 120" aria-hidden>
          <path
            fill="currentColor"
            opacity="0.12"
            d="M8 100C32 72 28 40 48 24c16-12 40-8 52 8 8 12 4 32-8 40-16 12-40 8-52-8-4-4-8-8-12-12z"
          />
        </svg>
        <svg className="hero__flourish hero__flourish--br" viewBox="0 0 120 120" aria-hidden>
          <path
            fill="currentColor"
            opacity="0.1"
            d="M100 20C76 48 80 80 60 96 44 108 20 104 8 88 0 76 4 56 16 48 32 36 56 40 68 56c4 4 8 8 12 12 8 8 16 16 20 24z"
          />
        </svg>
        <div className="hero__content">
          <p className="hero__eyebrow">{CONTENT.hero.subtitle}</p>
          <h1 className="hero__title">{CONTENT.hero.title}</h1>
          <button type="button" className="btn btn--primary" onClick={scrollToCard}>
            {CONTENT.hero.cta}
          </button>
        </div>
      </header>

      <main>
        <article
          id="card"
          className={`letter ${letterVisible ? 'is-visible' : ''}`}
          ref={(el) => {
            letterAttach(el)
            cardRef.current = el
          }}
        >
          <div className="letter__frame">
            <div className="letter__shine" aria-hidden />
            <div className="letter__inner">
              <p className="letter__greeting">{CONTENT.letter.greeting}</p>
              {CONTENT.letter.paragraphs.map((text, i) => (
                <p key={i} className="letter__p">
                  {text}
                </p>
              ))}
              <p className="letter__closing">{CONTENT.letter.closing}</p>
              <p className="letter__signature">{CONTENT.letter.signature}</p>
            </div>
          </div>
        </article>

        <section
          id="memories"
          className={`gallery-wrap ${galleryVisible ? 'is-visible' : ''}`}
          ref={(el) => {
            galleryAttach(el)
            galleryRef.current = el
          }}
          aria-labelledby="memories-heading"
        >
          <header className="gallery-wrap__header">
            <h2 id="memories-heading" className="gallery-wrap__title">
              {CONTENT.gallery.title}
            </h2>
            <p className="gallery-wrap__subtitle">{CONTENT.gallery.subtitle}</p>
          </header>

          <div className="gallery-grid">
            {GALLERY_ITEMS.map((item, i) => (
              <button
                type="button"
                key={item.id}
                className={`gallery-tile gallery-tile--${item.layout}`}
                onClick={() => openLightbox(i)}
              >
                <span className="gallery-tile__shine" aria-hidden />
                <img src={item.src} alt={item.alt} className="gallery-tile__img" loading={i < 3 ? 'eager' : 'lazy'} />
                {item.caption ? <span className="gallery-tile__caption">{item.caption}</span> : null}
              </button>
            ))}
          </div>
        </section>

        <section className={`finale ${finaleVisible ? 'is-visible' : ''}`} ref={finaleAttach} aria-label="Closing message">
          <div className="finale__glow" aria-hidden />
          <div className="finale__icon" aria-hidden>
            <svg className="finale__heart" viewBox="0 0 64 64" width="56" height="56">
              <path
                fill="currentColor"
                d="M32 56S8 38 8 22c0-8 6-14 14-14 4 0 8 2 10 5 2-3 6-5 10-5 8 0 14 6 14 14 0 16-24 34-24 34z"
              />
            </svg>
          </div>
          <p className="finale__line finale__line--1">{CONTENT.finale.line1}</p>
          <p className="finale__line finale__line--2">{CONTENT.finale.line2}</p>
          <p className="finale__line finale__line--3">{CONTENT.finale.line3}</p>
          <button type="button" className="btn btn--ghost" onClick={scrollToGallery}>
            {CONTENT.finale.replayCta}
          </button>
        </section>
      </main>

      <Lightbox index={lightboxIndex} items={GALLERY_ITEMS} onClose={closeLightbox} onPrev={onPrev} onNext={onNext} />
    </div>
  )
}
