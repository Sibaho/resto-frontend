/** Format a number as Indonesian Rupiah (no decimals), e.g. 48000 → "Rp 48.000". */
export function formatRupiah(amount: number): string {
  return "Rp " + Math.round(amount).toLocaleString("id-ID");
}
