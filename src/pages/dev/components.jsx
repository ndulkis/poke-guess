import React from 'react'
import Navbar from '../../components/Navbar'
import Timer from '../../components/Timer'
import GuessInput from '../../components/GuessInput'
import HintDisplay from '../../components/HintDisplay'
import ScoreDisplay from '../../components/ScoreDisplay'
import PokemonSilhouette from '../../components/PokemonSilhouette'
import SkipButton from '../../components/SkipButton'
import PokemonCard from '../../components/PokemonCard'
import SearchBar from '../../components/SearchBar'
import FilterControls from '../../components/FilterControls'
import RankBadge from '../../components/RankBadge'
import ResultsSummary from '../../components/ResultsSummary'
import ShareButton from '../../components/ShareButton'

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '2rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
      <h2 style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function components() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        Dev — Component Gallery
      </h1>

      <Section title="Navbar">
        <Navbar />
      </Section>

      <Section title="Timer">
        <Timer />
      </Section>

      <Section title="GuessInput">
        <GuessInput />
      </Section>

      <Section title="HintDisplay">
        <HintDisplay />
      </Section>

      <Section title="ScoreDisplay">
        <ScoreDisplay />
      </Section>

      <Section title="PokemonSilhouette">
        <PokemonSilhouette />
      </Section>

      <Section title="SkipButton">
        <SkipButton />
      </Section>

      <Section title="PokemonCard">
        <PokemonCard />
      </Section>

      <Section title="SearchBar">
        <SearchBar />
      </Section>

      <Section title="FilterControls">
        <FilterControls />
      </Section>

      <Section title="RankBadge">
        <RankBadge />
      </Section>

      <Section title="ResultsSummary">
        <ResultsSummary />
      </Section>

      <Section title="ShareButton">
        <ShareButton />
      </Section>
    </div>
  )
}

export default components
