import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '@/src/components/ui/Modal'

describe('Modal', () => {
  // ============================================
  // TESTES DE RENDERIZAÇÃO
  // ============================================

  describe('Renderização', () => {
    it('deve renderizar o modal quando isOpen é true', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Título do Modal">
          <p>Conteúdo do modal</p>
        </Modal>
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Título do Modal')).toBeInTheDocument()
      expect(screen.getByText('Conteúdo do modal')).toBeInTheDocument()
    })

    it('não deve renderizar nada quando isOpen é false', () => {
      render(
        <Modal isOpen={false} onClose={() => {}} title="Título do Modal">
          <p>Conteúdo do modal</p>
        </Modal>
      )

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.queryByText('Título do Modal')).not.toBeInTheDocument()
    })

    it('deve renderizar o título corretamente', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Meu Modal de Teste">
          <p>Conteúdo</p>
        </Modal>
      )

      expect(screen.getByText('Meu Modal de Teste')).toBeInTheDocument()
    })

    it('deve renderizar o children corretamente', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Teste">
          <div data-testid="custom-content">
            <p>Parágrafo 1</p>
            <p>Parágrafo 2</p>
          </div>
        </Modal>
      )

      expect(screen.getByTestId('custom-content')).toBeInTheDocument()
      expect(screen.getByText('Parágrafo 1')).toBeInTheDocument()
      expect(screen.getByText('Parágrafo 2')).toBeInTheDocument()
    })

    it('deve ter o botão de fechar com aria-label correto', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Teste">
          <p>Conteúdo</p>
        </Modal>
      )

      const closeButton = screen.getByLabelText('Close modal')
      expect(closeButton).toBeInTheDocument()
    })
  })

  // ============================================
  // TESTES DE INTERAÇÃO
  // ============================================

  describe('Interações', () => {
    it('deve chamar onClose ao clicar no botão de fechar', () => {
      const onCloseMock = vi.fn()

      render(
        <Modal isOpen={true} onClose={onCloseMock} title="Teste">
          <p>Conteúdo</p>
        </Modal>
      )

      const closeButton = screen.getByLabelText('Close modal')
      fireEvent.click(closeButton)

      expect(onCloseMock).toHaveBeenCalledTimes(1)
    })

    it('deve chamar onClose ao clicar no backdrop (fundo)', () => {
      const onCloseMock = vi.fn()

      render(
        <Modal isOpen={true} onClose={onCloseMock} title="Teste">
          <p>Conteúdo</p>
        </Modal>
      )

      // O backdrop é o elemento com role="dialog" que tem o onClick={onClose}
      const backdrop = screen.getByRole('dialog')
      fireEvent.click(backdrop)

      expect(onCloseMock).toHaveBeenCalledTimes(1)
    })

    it('não deve chamar onClose ao clicar dentro do conteúdo do modal', () => {
      const onCloseMock = vi.fn()

      render(
        <Modal isOpen={true} onClose={onCloseMock} title="Teste">
          <p data-testid="modal-content">Conteúdo clicável</p>
        </Modal>
      )

      const content = screen.getByTestId('modal-content')
      fireEvent.click(content)

      expect(onCloseMock).not.toHaveBeenCalled()
    })

    it('deve chamar onClose ao pressionar a tecla Escape', () => {
      const onCloseMock = vi.fn()

      render(
        <Modal isOpen={true} onClose={onCloseMock} title="Teste">
          <p>Conteúdo</p>
        </Modal>
      )

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(onCloseMock).toHaveBeenCalledTimes(1)
    })

    it('não deve chamar onClose ao pressionar outras teclas', () => {
      const onCloseMock = vi.fn()

      render(
        <Modal isOpen={true} onClose={onCloseMock} title="Teste">
          <p>Conteúdo</p>
        </Modal>
      )

      fireEvent.keyDown(document, { key: 'Enter' })
      fireEvent.keyDown(document, { key: 'Tab' })
      fireEvent.keyDown(document, { key: 'a' })

      expect(onCloseMock).not.toHaveBeenCalled()
    })
  })

  // ============================================
  // TESTES DE ACESSIBILIDADE
  // ============================================

  describe('Acessibilidade', () => {
    it('deve ter aria-modal="true"', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Teste">
          <p>Conteúdo</p>
        </Modal>
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('deve ter role="dialog"', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Teste">
          <p>Conteúdo</p>
        </Modal>
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  // ============================================
  // TESTES DE DIFERENTES CONTEÚDOS
  // ============================================

  describe('Diferentes tipos de conteúdo', () => {
    it('deve renderizar formulário dentro do modal', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Formulário">
          <form data-testid="form-test">
            <input type="text" placeholder="Nome" />
            <button type="submit">Enviar</button>
          </form>
        </Modal>
      )

      expect(screen.getByTestId('form-test')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Nome')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument()
    })

    it('deve renderizar lista dentro do modal', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Lista">
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </Modal>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('deve renderizar títulos longos', () => {
      const longTitle = 'Este é um título muito longo para testar se o modal consegue lidar com textos extensos'

      render(
        <Modal isOpen={true} onClose={() => {}} title={longTitle}>
          <p>Conteúdo</p>
        </Modal>
      )

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })
  })
})
