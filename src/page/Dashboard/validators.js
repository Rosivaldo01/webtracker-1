// src/pages/Dashboard/validators.js
export const regexLetrasEspacos = /^[\p{L} ]+$/u;
export const regexAlnumEspacos = /^[\p{L}\d ]+$/u;
export const regexNumeros = /^\d+$/;
export const temLetra = /\p{L}/u;
export const temLetraOuNumero = /[\p{L}\d]/u;

export function validarLetrasEspacos(campo, nomeCampo) {
    if (!regexLetrasEspacos.test(campo) || !temLetra.test(campo)) {
        alert(`${nomeCampo} inválido! Use apenas letras e espaços, e pelo menos uma letra.`);
        return false;
    }
    if (campo.trim().length < 3) {
        alert(`${nomeCampo} deve ter pelo menos 3 caracteres.`);
        return false;
    }
    return true;
}

export function validarAlnumEspacos(campo, nomeCampo) {
    if (!regexAlnumEspacos.test(campo) || !temLetraOuNumero.test(campo)) {
        alert(`${nomeCampo} inválido! Use letras, números e espaços, com pelo menos um caractere válido.`);
        return false;
    }
    if (campo.trim().length < 3) {
        alert(`${nomeCampo} deve ter pelo menos 3 caracteres.`);
        return false;
    }
    return true;
}

export function validarNumeros(campo, nomeCampo) {
    if (!regexNumeros.test(campo)) {
        alert(`${nomeCampo} inválido! Use apenas números.`);
        return false;
    }
    if (campo.trim().length < 3) {
        alert(`${nomeCampo} deve ter pelo menos 3 caracteres.`);
        return false;
    }
    if (campo.length > 20) {
        alert(`${nomeCampo} não pode ter mais que 20 caracteres.`);
        return false;
    }
    return true;
}

export function matriculaExiste(matriculaBuscada, registros, idAtual = null) {
    return registros.some(
        (reg) =>
            reg.matricula === matriculaBuscada && (idAtual === null || reg.id !== idAtual)
    );
}
