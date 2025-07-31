function toRupiah(num) {
    if (num === null || num === undefined) return '-';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(num);
}

module.exports = { toRupiah };
