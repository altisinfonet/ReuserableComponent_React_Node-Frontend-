import { toast } from 'react-toastify';
// import { POSITION } from 'react-toastify'; // Add this line 

const autoClose = 1000;
const position = 'top-right'; // Change this line 

const _INFO = (msg = "INFO's TOAST!") => {
    toast.info(msg, { position, autoClose });
}

const _ERROR = (msg = "ERROR's TOAST!") => { // Change the default message 
    toast.error(msg, { position, autoClose });
}

const _SUCCESS = (msg = "SUCCESS's TOAST!") => { // Change the default message 
    toast.success(msg, { position, autoClose });
}

const _WARNING = (msg = "WARNING's TOAST!") => { // Fix the typo in function name 
    toast.warn(msg, { position, autoClose }); // Fix the typo in function name 
}

export {
    _INFO,
    _ERROR,
    _SUCCESS,
    _WARNING // Update the export name 
}


