import DOMPurify from "dompurify";

export function validateCompanyName(nome) {
    const nomeSanitizado = DOMPurify.sanitize(nome.trim());
    const nomeSemEspacos = nomeSanitizado.replace(/\s/g, '');
    const nomeRegex = /^[A-Za-zÀ-ÿ0-9\s]+$/;

    if (!nomeSanitizado || nomeSemEspacos.length < 3 || nomeSanitizado.length > 60 || !nomeRegex.test(nomeSanitizado)) {
        return "Informe o nome da companhia com pelo menos 3 letras ou números e no máximo 60 caracteres.";
    }
    return null;
}

export function validarSenha(senha) {
    if (!senha || senha.length < 6) {
        return "A senha deve conter pelo menos 6 caracteres.";
    }
    return null;
}
