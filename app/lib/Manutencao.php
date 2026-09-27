<?php
/* ============================================================================
   LIMPEZA AUTOMÁTICA (sem cron)
   Hospedagem compartilhada nem sempre tem agendador de tarefas à mão, então
   a limpeza roda sozinha, no máximo uma vez por dia, na carona de quem
   abrir o painel. Cumpre o que a Política de Privacidade promete:
   - contato que não virou cliente é anonimizado depois de 'retencao_meses'
   - reuniões antigas perdem nome e telefone depois do mesmo prazo
   - trilha de auditoria guarda 12 meses; contadores de tentativa, 2 dias
   ========================================================================= */
declare(strict_types=1);

final class Manutencao
{
  public static function talvez(): void
  {
    try {
      $ultima = (string) Banco::opcao('manutencao_ultima', '');
      if ($ultima !== '' && $ultima > (new DateTimeImmutable('-1 day'))->format(DATE_ATOM)) return;
      Banco::definirOpcao('manutencao_ultima', agora_iso());
      self::rodar();
    } catch (Throwable $e) {
      error_log('manutencao: ' . $e->getMessage());
    }
  }

  public static function rodar(): array
  {
    $meses = max(6, (int) astro_config('retencao_meses', 24));
    $corte = (new DateTimeImmutable("-{$meses} months"))->format(DATE_ATOM);
    $agora = agora_iso();
    $leads = Banco::exec(
      "UPDATE leads SET dados_cripto = NULL, nota_cripto = NULL, fone_indice = NULL, origem = NULL, historico = NULL, excluido = ?
        WHERE excluido IS NULL AND etapa <> 'fechado' AND atualizado < ?", [$agora, $corte]);
    $reunioes = Banco::exec('UPDATE reservas SET dados_cripto = NULL WHERE dados_cripto IS NOT NULL AND criada < ?', [$corte]);
    Banco::exec('DELETE FROM auditoria WHERE quando < ?', [(new DateTimeImmutable('-12 months'))->format(DATE_ATOM)]);
    Banco::exec('DELETE FROM limites WHERE inicio < ?', [time() - 2 * 86400]);
    /* arquivos de sessão velhos: o coletor do PHP às vezes está desligado */
    foreach (glob(ASTRO_DADOS . '/sessoes/sess_*') ?: [] as $f) if (filemtime($f) < time() - 2 * 86400) @unlink($f);
    if ($leads || $reunioes) Auditoria::registrar('retencao', '', ['leads' => $leads, 'reunioes' => $reunioes], null);
    return ['leads' => $leads, 'reunioes' => $reunioes];
  }
}
