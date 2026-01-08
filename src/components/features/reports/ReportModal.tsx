"use client";

import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { PDFViewer } from '@react-pdf/renderer';
import { FileText, Download, Loader2, Eye, ArrowLeft, X } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { SECTORS } from '@/src/constants/constants';
import SectorReportPDF from '@/src/components/features/reports/SectorReportPDF';
import { getReportDataBySector } from '@/src/app/actions/report.actions';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para pré-visualização
  const [showPreview, setShowPreview] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [generatedAt, setGeneratedAt] = useState<string>('');

  const handleGeneratePreview = async () => {
    if (!selectedSector) {
      setError('Selecione um setor para gerar o relatório.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getReportDataBySector(selectedSector);

      if (!data || data.processes.length === 0) {
        setError('Nenhum processo encontrado para este setor.');
        setIsLoading(false);
        return;
      }

      setReportData(data);
      setGeneratedAt(new Date().toLocaleString('pt-BR'));
      setShowPreview(true);
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      setError('Erro ao gerar o relatório. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!reportData) return;

    setIsLoading(true);

    try {
      const blob = await pdf(
        <SectorReportPDF
          sector={selectedSector}
          processes={reportData.processes}
          generatedAt={generatedAt}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-${selectedSector.replace(/\//g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao baixar relatório:', err);
      setError('Erro ao baixar o relatório. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSelection = () => {
    setShowPreview(false);
    setReportData(null);
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedSector('');
      setError(null);
      setShowPreview(false);
      setReportData(null);
      onClose();
    }
  };

  // Se estiver mostrando a pré-visualização, renderiza em tela cheia
  if (showPreview && reportData) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
        {/* Header da pré-visualização */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToSelection}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <div className="h-6 w-px bg-gray-600" />
            <div>
              <h2 className="text-white font-semibold">Pré-visualização do Relatório</h2>
              <p className="text-gray-400 text-sm">Setor: {selectedSector}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Baixando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Baixar PDF
                </>
              )}
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visualizador do PDF */}
        <div className="flex-1 bg-gray-700">
          <PDFViewer
            width="100%"
            height="100%"
            showToolbar={false}
            className="border-0"
          >
            <SectorReportPDF
              sector={selectedSector}
              processes={reportData.processes}
              generatedAt={generatedAt}
            />
          </PDFViewer>
        </div>
      </div>
    );
  }

  // Modal de seleção de setor
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Gerar Relatório por Setor">
      <div className="space-y-6">
        {/* Descrição */}
        <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Selecione um setor para gerar um relatório PDF contendo todos os processos,
              riscos e controles associados. Você poderá visualizar o relatório antes de baixá-lo.
            </p>
          </div>
        </div>

        {/* Seleção de Setor */}
        <div>
          <label
            htmlFor="sector-select"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Setor *
          </label>
          <select
            id="sector-select"
            value={selectedSector}
            onChange={(e) => {
              setSelectedSector(e.target.value);
              setError(null);
            }}
            disabled={isLoading}
            className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
          >
            <option value="">Selecione o setor...</option>
            {SECTORS.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGeneratePreview}
            disabled={isLoading || !selectedSector}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Visualizar Relatório
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
