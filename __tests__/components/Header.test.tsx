import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from '@/src/components/Header'

describe('Header', () => {

  // ============================================
  // TESTES DE RENDERIZAÇÃO
  // ============================================

  describe('Renderização', () => {
    it('deve renderizar o componente Header', () => {
      render(<Header />)

      // O header deve existir
      const header = screen.getByText('Dashboard')
      expect(header).toBeInTheDocument()
    })

    it('deve renderizar o título "Dashboard"', () => {
      render(<Header />)

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('deve ter a classe de estilização correta para o título', () => {
      render(<Header />)

      const title = screen.getByText('Dashboard')
      expect(title).toHaveClass('text-xl')
      expect(title).toHaveClass('font-semibold')
    })
  })

  // ============================================
  // TESTES DE ESTRUTURA
  // ============================================

  describe('Estrutura', () => {
    it('deve ter um container principal', () => {
      const { container } = render(<Header />)

      const mainDiv = container.firstChild as HTMLElement
      expect(mainDiv).toHaveClass('flex')
      expect(mainDiv).toHaveClass('justify-end')
      expect(mainDiv).toHaveClass('items-center')
    })

    it('deve ter classes de estilização do container', () => {
      const { container } = render(<Header />)

      const mainDiv = container.firstChild as HTMLElement
      expect(mainDiv).toHaveClass('mb-6')
      expect(mainDiv).toHaveClass('p-2')
      expect(mainDiv).toHaveClass('rounded-lg')
      expect(mainDiv).toHaveClass('shadow-md')
    })

    it('deve ter classes para tema claro e escuro', () => {
      const { container } = render(<Header />)

      const mainDiv = container.firstChild as HTMLElement
      expect(mainDiv).toHaveClass('bg-white')
      expect(mainDiv).toHaveClass('dark:bg-gray-800')
    })

    it('deve ter título com classes de tema', () => {
      render(<Header />)

      const title = screen.getByText('Dashboard')
      expect(title).toHaveClass('text-gray-800')
      expect(title).toHaveClass('dark:text-gray-100')
    })

    it('deve ter título alinhado à esquerda com mr-auto', () => {
      render(<Header />)

      const title = screen.getByText('Dashboard')
      expect(title).toHaveClass('mr-auto')
    })
  })

  // ============================================
  // TESTES DE ACESSIBILIDADE
  // ============================================

  describe('Acessibilidade', () => {
    it('deve usar elemento h2 para o título', () => {
      render(<Header />)

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Dashboard')
    })
  })

  // ============================================
  // TESTES DE SNAPSHOT (opcional)
  // ============================================

  describe('Snapshot', () => {
    it('deve corresponder ao snapshot', () => {
      const { container } = render(<Header />)

      expect(container).toMatchSnapshot()
    })
  })
})
