import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Process, Risk, Control } from '@/types';

// Cores institucionais
const COLORS = {
  primary: '#1e3a5f',
  secondary: '#2c5282',
  accent: '#4a90a4',
  headerText: '#ffffff',
  tableBorder: '#cbd5e0',
  tableHeaderBg: '#e2e8f0',
  lightBg: '#f7fafc',
  text: '#2d3748',
  textLight: '#718096',
  critical: '#c53030',
  high: '#dd6b20',
  medium: '#d69e2e',
  low: '#38a169',
  veryLow: '#319795',
  controlBg: '#f0fdf4',
  controlHeader: '#166534',
};

// Estilos do PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 60,
    fontSize: 9,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  // Cabeçalho com logo
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    borderBottomStyle: 'solid',
  },
  logo: {
    width: 160,
    height: 55,
  },
  headerTextContainer: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 3,
  },
  headerSubtitle: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  // Informações do relatório
  reportInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    padding: 10,
    backgroundColor: COLORS.lightBg,
    borderRadius: 4,
  },
  reportInfoItem: {
    flexDirection: 'row',
  },
  reportInfoLabel: {
    fontSize: 9,
    color: COLORS.textLight,
    marginRight: 5,
  },
  reportInfoValue: {
    fontSize: 9,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  // Processo
  processHeader: {
    backgroundColor: COLORS.primary,
    padding: 10,
    marginBottom: 10,
    borderRadius: 4,
  },
  processTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.headerText,
    marginBottom: 4,
  },
  processInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  processInfoItem: {
    flexDirection: 'row',
    marginRight: 15,
  },
  processLabel: {
    fontSize: 8,
    color: COLORS.headerText,
    opacity: 0.8,
    marginRight: 4,
  },
  processValue: {
    fontSize: 8,
    color: COLORS.headerText,
    fontWeight: 'bold',
  },
  // Seção de riscos
  sectionHeader: {
    backgroundColor: COLORS.tableHeaderBg,
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
    borderLeftStyle: 'solid',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  // Container do risco
  riskContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.tableBorder,
    borderStyle: 'solid',
    borderRadius: 4,
  },
  // Tabela de risco - Header
  riskHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    padding: 6,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  riskHeaderCell: {
    color: COLORS.headerText,
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Tabela de risco - Row
  riskRow: {
    flexDirection: 'row',
    padding: 6,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.tableBorder,
    borderBottomStyle: 'solid',
  },
  riskCell: {
    fontSize: 7,
    color: COLORS.text,
    textAlign: 'center',
  },
  // Badges de risco
  riskBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    fontSize: 6,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  badgeCritical: { backgroundColor: '#fed7d7', color: COLORS.critical },
  badgeHigh: { backgroundColor: '#feebc8', color: COLORS.high },
  badgeMedium: { backgroundColor: '#fefcbf', color: COLORS.medium },
  badgeLow: { backgroundColor: '#c6f6d5', color: COLORS.low },
  badgeVeryLow: { backgroundColor: '#b2f5ea', color: COLORS.veryLow },
  // Detalhes do risco
  detailBox: {
    padding: 8,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.tableBorder,
    borderBottomStyle: 'solid',
  },
  detailTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 7,
    color: COLORS.text,
    marginBottom: 2,
    paddingLeft: 8,
  },

  // ==========================================
  // CONTROLES
  // ==========================================
  controlsBox: {
    padding: 10,
    backgroundColor: COLORS.controlBg,
  },
  controlsTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.controlHeader,
    marginBottom: 8,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#86efac',
    borderBottomStyle: 'solid',
  },

  // Card do controle - com minPresenceAhead para evitar órfãos
  controlCard: {
    backgroundColor: '#ffffff',
    marginBottom: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderStyle: 'solid',
  },

  // Header + primeira seção juntos (não podem ser separados)
  controlHeaderSection: {
    minPresenceAhead: 100, // Garante pelo menos 100pts de conteúdo junto com o header
  },

  controlHeader: {
    backgroundColor: COLORS.secondary,
    padding: 6,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlName: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  controlStatus: {
    fontSize: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    fontWeight: 'bold',
    backgroundColor: '#fca5a5',
    color: '#991b1b',
  },
  statusImplemented: { backgroundColor: '#a5b4fc', color: '#3730a3' },
  statusOnTime: { backgroundColor: '#86efac', color: '#166534' },
  statusNearDue: { backgroundColor: '#fde047', color: '#854d0e' },
  statusOverdue: { backgroundColor: '#fca5a5', color: '#991b1b' },

  // Corpo do controle
  controlBody: {
    padding: 8,
  },

  // Bloco inicial que deve ficar junto com o header
  controlInitialBlock: {
    // Este bloco contém as primeiras informações e não deve ser separado do header
  },

  // Grid de 2 colunas
  gridRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  gridCol: {
    flex: 1,
    paddingRight: 8,
  },
  fieldLabel: {
    fontSize: 6,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  fieldValue: {
    fontSize: 7,
    color: COLORS.text,
  },
  fieldValueBold: {
    fontSize: 7,
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  // Seção de texto
  textBox: {
    marginTop: 6,
    padding: 6,
    backgroundColor: '#f9fafb',
    borderRadius: 3,
  },
  textBoxTitle: {
    fontSize: 6,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  textBoxContent: {
    fontSize: 7,
    color: COLORS.text,
  },

  // Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 3,
  },
  tag: {
    fontSize: 6,
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
    marginRight: 4,
    marginBottom: 2,
  },

  // Datas
  datesRow: {
    marginTop: 6,
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    padding: 6,
    borderRadius: 3,
  },
  dateCol: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 6,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 7,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  dateSeparator: {
    width: 1,
    backgroundColor: '#bfdbfe',
    marginHorizontal: 6,
  },

  // Rodapé
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.tableBorder,
    borderTopStyle: 'solid',
  },
  footerText: {
    fontSize: 7,
    color: COLORS.textLight,
  },

  // Divisor
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.tableBorder,
    borderBottomStyle: 'solid',
    marginVertical: 12,
  },
  noData: {
    fontSize: 8,
    color: COLORS.textLight,
    fontStyle: 'italic',
    padding: 10,
  },

  // Colunas da tabela
  colNum: { width: '6%' },
  colRisk: { width: '28%' },
  colType: { width: '11%' },
  colImpact: { width: '11%' },
  colFreq: { width: '11%' },
  colInherent: { width: '11%' },
  colFac: { width: '11%' },
  colResidual: { width: '11%' },
});

// Interfaces
interface ProcessWithRisks extends Process {
  risks: RiskWithControls[];
}

interface RiskWithControls extends Risk {
  controls: Control[];
}

interface SectorReportPDFProps {
  sector: string;
  processes: ProcessWithRisks[];
  generatedAt: string;
}

// Funções auxiliares
function getResidualRiskLevel(value: number) {
  if (value > 15) return { label: 'Crítico', style: styles.badgeCritical };
  if (value > 10) return { label: 'Alto', style: styles.badgeHigh };
  if (value > 7) return { label: 'Médio', style: styles.badgeMedium };
  if (value > 3) return { label: 'Baixo', style: styles.badgeLow };
  return { label: 'Muito Baixo', style: styles.badgeVeryLow };
}

function getInherentRiskLevel(value: number) {
  if (value > 15) return 'Crítico';
  if (value > 10) return 'Alto';
  if (value > 7) return 'Médio';
  if (value > 3) return 'Baixo';
  return 'Muito Baixo';
}

function getFacLabel(fac: number) {
  if (fac <= 0.2) return 'Forte';
  if (fac <= 0.4) return 'Satisfatório';
  if (fac <= 0.6) return 'Mediano';
  if (fac <= 0.8) return 'Fraco';
  return 'Ineficaz';
}

function getProbabilityLabel(value: number) {
  const labels = ['', 'Muito Baixa', 'Baixa', 'Média', 'Alta', 'Muito Alta'];
  return labels[value] || '-';
}

function getImpactLabel(value: number) {
  const labels = ['', 'Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Crítico'];
  return labels[value] || '-';
}

function getControlStatusInfo(control: Control) {
  if (control.implemented) {
    return { label: 'Implementado', style: styles.statusImplemented };
  }
  if (!control.plannedEndDate) {
    return { label: 'Sem prazo definido', style: styles.statusOnTime };
  }
  const today = new Date();
  const endDate = new Date(control.plannedEndDate);
  const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: `Atrasado (${Math.abs(diffDays)} dias)`, style: styles.statusOverdue };
  if (diffDays <= 30) return { label: `${diffDays} dias restantes`, style: styles.statusNearDue };
  return { label: `${diffDays} dias restantes`, style: styles.statusOnTime };
}

function formatDate(date?: string | null) {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
}

// Componente do PDF
export default function SectorReportPDF({ sector, processes, generatedAt }: SectorReportPDFProps) {
  const logoSrc = '/Logo_CGM_Azul.png';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho com Logo - Fixo em todas as páginas */}
        <View style={styles.header} fixed>
          <Image style={styles.logo} src={logoSrc} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Matriz de Gerenciamento de Riscos</Text>
            <Text style={styles.headerSubtitle}>Relatório por Setor</Text>
          </View>
        </View>

        {/* Informações do relatório */}
        <View style={styles.reportInfo}>
          <View style={styles.reportInfoItem}>
            <Text style={styles.reportInfoLabel}>Setor:</Text>
            <Text style={styles.reportInfoValue}>{sector}</Text>
          </View>
          <View style={styles.reportInfoItem}>
            <Text style={styles.reportInfoLabel}>Data de Geração:</Text>
            <Text style={styles.reportInfoValue}>{generatedAt}</Text>
          </View>
        </View>

        {/* Processos */}
        {processes.length === 0 ? (
          <Text style={styles.noData}>Nenhum processo cadastrado neste setor.</Text>
        ) : (
          processes.map((process, pIdx) => (
            <View key={process.id}>
              {/* Header do Processo */}
              <View style={styles.processHeader}>
                <Text style={styles.processTitle}>{pIdx + 1}. {process.name}</Text>
                <View style={styles.processInfoRow}>
                  <View style={styles.processInfoItem}>
                    <Text style={styles.processLabel}>Gestor:</Text>
                    <Text style={styles.processValue}>{process.manager || '-'}</Text>
                  </View>
                  <View style={styles.processInfoItem}>
                    <Text style={styles.processLabel}>Setor:</Text>
                    <Text style={styles.processValue}>{process.sector}</Text>
                  </View>
                </View>
              </View>

              {/* Seção de Riscos */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Riscos Identificados ({process.risks.length})</Text>
              </View>

              {process.risks.length === 0 ? (
                <Text style={styles.noData}>Nenhum risco cadastrado.</Text>
              ) : (
                process.risks.map((risk, rIdx) => {
                  const residualLevel = getResidualRiskLevel(risk.residualRisk);

                  return (
                    <View key={risk.id} style={styles.riskContainer}>
                      {/* Tabela do Risco - Header */}
                      <View style={styles.riskHeader}>
                        <Text style={[styles.riskHeaderCell, styles.colNum]}>Nº</Text>
                        <Text style={[styles.riskHeaderCell, styles.colRisk]}>Risco</Text>
                        <Text style={[styles.riskHeaderCell, styles.colType]}>Tipo</Text>
                        <Text style={[styles.riskHeaderCell, styles.colImpact]}>Impacto</Text>
                        <Text style={[styles.riskHeaderCell, styles.colFreq]}>Freq.</Text>
                        <Text style={[styles.riskHeaderCell, styles.colInherent]}>R.Inerente</Text>
                        <Text style={[styles.riskHeaderCell, styles.colFac]}>FAC</Text>
                        <Text style={[styles.riskHeaderCell, styles.colResidual]}>R.Residual</Text>
                      </View>

                      {/* Tabela do Risco - Dados */}
                      <View style={styles.riskRow}>
                        <Text style={[styles.riskCell, styles.colNum]}>R-{rIdx + 1}</Text>
                        <Text style={[styles.riskCell, styles.colRisk, { textAlign: 'left' }]}>{risk.name}</Text>
                        <Text style={[styles.riskCell, styles.colType]}>{risk.type}</Text>
                        <Text style={[styles.riskCell, styles.colImpact]}>{getImpactLabel(risk.impact)}</Text>
                        <Text style={[styles.riskCell, styles.colFreq]}>{getProbabilityLabel(risk.probability)}</Text>
                        <Text style={[styles.riskCell, styles.colInherent]}>{getInherentRiskLevel(risk.inherentRisk)}</Text>
                        <Text style={[styles.riskCell, styles.colFac]}>{getFacLabel(risk.fac)}</Text>
                        <View style={[styles.colResidual, { justifyContent: 'center', alignItems: 'center' }]}>
                          <Text style={[styles.riskBadge, residualLevel.style]}>{residualLevel.label}</Text>
                        </View>
                      </View>

                      {/* Causas */}
                      {risk.causes && (
                        <View style={styles.detailBox}>
                          <Text style={styles.detailTitle}>Causas do Risco</Text>
                          {risk.causes.split('\n').filter(c => c.trim()).map((causa, i) => (
                            <Text key={i} style={styles.detailText}>• {causa.trim()}</Text>
                          ))}
                        </View>
                      )}

                      {/* Consequências */}
                      {risk.consequences && (
                        <View style={styles.detailBox}>
                          <Text style={styles.detailTitle}>Consequências</Text>
                          {risk.consequences.split('\n').filter(c => c.trim()).map((conseq, i) => (
                            <Text key={i} style={styles.detailText}>• {conseq.trim()}</Text>
                          ))}
                        </View>
                      )}

                      {/* Controles */}
                      {risk.controls.length > 0 ? (
                        <View style={styles.controlsBox}>
                          <Text style={styles.controlsTitle}>Controles Cadastrados ({risk.controls.length})</Text>

                          {risk.controls.map((control, cIdx) => {
                            const statusInfo = getControlStatusInfo(control);

                            return (
                              <View key={control.id} style={styles.controlCard} wrap={false}>
                                {/* Header do Controle */}
                                <View style={styles.controlHeader}>
                                  <Text style={styles.controlName}>{cIdx + 1}. {control.name}</Text>
                                  <Text style={[styles.controlStatus, statusInfo.style]}>{statusInfo.label}</Text>
                                </View>

                                {/* Body do Controle */}
                                <View style={styles.controlBody}>
                                  {/* Linha 1 */}
                                  <View style={styles.gridRow}>
                                    <View style={styles.gridCol}>
                                      <Text style={styles.fieldLabel}>Tipo</Text>
                                      <Text style={styles.fieldValue}>{control.type}</Text>
                                    </View>
                                    <View style={styles.gridCol}>
                                      <Text style={styles.fieldLabel}>Natureza</Text>
                                      <Text style={styles.fieldValue}>{control.nature}</Text>
                                    </View>
                                    <View style={styles.gridCol}>
                                      <Text style={styles.fieldLabel}>Relação com o Risco</Text>
                                      <Text style={styles.fieldValue}>{control.relationToRisk}</Text>
                                    </View>
                                  </View>

                                  {/* Linha 2 */}
                                  <View style={styles.gridRow}>
                                    <View style={styles.gridCol}>
                                      <Text style={styles.fieldLabel}>Responsável</Text>
                                      <Text style={styles.fieldValueBold}>{control.responsible || '-'}</Text>
                                    </View>
                                    <View style={styles.gridCol}>
                                      <Text style={styles.fieldLabel}>Novo ou Modificado</Text>
                                      <Text style={styles.fieldValue}>{control.newOrModified}</Text>
                                    </View>
                                    <View style={styles.gridCol}>
                                      <Text style={styles.fieldLabel}>Implementado</Text>
                                      <Text style={[styles.fieldValueBold, { color: control.implemented ? '#166534' : '#dc2626' }]}>
                                        {control.implemented ? 'Sim' : 'Não'}
                                      </Text>
                                    </View>
                                  </View>

                                  {/* Método de Implementação */}
                                  {control.implementationMethod && (
                                    <View style={styles.textBox}>
                                      <Text style={styles.textBoxTitle}>Método de Implementação</Text>
                                      <Text style={styles.textBoxContent}>{control.implementationMethod}</Text>
                                    </View>
                                  )}

                                  {/* Macroetapas */}
                                  {control.macroSteps && (
                                    <View style={styles.textBox}>
                                      <Text style={styles.textBoxTitle}>Macroetapas</Text>
                                      <Text style={styles.textBoxContent}>{control.macroSteps}</Text>
                                    </View>
                                  )}

                                  {/* Análise de Adequação */}
                                  {control.adequacyAnalysis && (
                                    <View style={styles.textBox}>
                                      <Text style={styles.textBoxTitle}>Análise de Adequação</Text>
                                      <Text style={styles.textBoxContent}>{control.adequacyAnalysis}</Text>
                                    </View>
                                  )}

                                  {/* Setores Envolvidos */}
                                  {control.involvedSectors && control.involvedSectors.length > 0 && (
                                    <View style={[styles.textBox, { backgroundColor: '#f0f9ff' }]}>
                                      <Text style={styles.textBoxTitle}>Setores Envolvidos</Text>
                                      <View style={styles.tagsRow}>
                                        {control.involvedSectors.map((setor, sIdx) => (
                                          <Text key={sIdx} style={styles.tag}>{setor}</Text>
                                        ))}
                                      </View>
                                    </View>
                                  )}

                                  {/* Datas */}
                                  <View style={styles.datesRow}>
                                    <View style={styles.dateCol}>
                                      <Text style={styles.dateLabel}>Início Previsto</Text>
                                      <Text style={styles.dateValue}>{formatDate(control.plannedStartDate)}</Text>
                                    </View>
                                    <View style={styles.dateSeparator} />
                                    <View style={styles.dateCol}>
                                      <Text style={styles.dateLabel}>Fim Previsto</Text>
                                      <Text style={styles.dateValue}>{formatDate(control.plannedEndDate)}</Text>
                                    </View>
                                    <View style={styles.dateSeparator} />
                                    <View style={styles.dateCol}>
                                      <Text style={styles.dateLabel}>Fim Real</Text>
                                      <Text style={styles.dateValue}>{formatDate(control.actualEndDate)}</Text>
                                    </View>
                                  </View>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      ) : (
                        <View style={styles.detailBox}>
                          <Text style={[styles.detailText, { fontStyle: 'italic' }]}>
                            Não foram cadastrados controles para esse risco
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })
              )}

              {/* Divisor entre processos */}
              {pIdx < processes.length - 1 && <View style={styles.divider} />}
            </View>
          ))
        )}

        {/* Rodapé - Fixo em todas as páginas */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Controladoria-Geral do Município do Rio de Janeiro</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
