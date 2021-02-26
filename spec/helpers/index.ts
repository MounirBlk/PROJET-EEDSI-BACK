
/**
 *  Random name file 
 */ 
export const randomFileName = (): string => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var minSecMili = today.getMinutes() + '' + today.getSeconds() + '' + today.getMilliseconds()
    return dd + '-' + mm + '-' + yyyy + '_' + minSecMili;
}

/**
 *  Random char 
 *  @param {number} length? 
 */ 
export const randomChars = (length: number = 10): string => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

/**
 *  Conversion to form body 
 *  @param {Object} data 
 */ 

export const convertToFormBody = (data: any) => {
    let formBody: any = [];
    for (let property in data) {
        //cardDetails.hasOwnProperty(property)
        formBody.push(encodeURIComponent(property) + '=' + encodeURIComponent(data[property]));
    }
    return formBody.join("&");
}

/**
 *  Conversion to UrlEncoded
 *  @param {Object} data 
 */ 
export const toUrlEncoded = (obj: any) => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');

/**
 *  Conversion to form data
 *  @param {Object} data 
 */ 
export const getFormData = (object: any) => {
    const formData = new FormData();
    Object.keys(object).forEach(key => formData.append(key, object[key]));
    return formData;
}