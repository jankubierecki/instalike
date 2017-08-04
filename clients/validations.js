class Validators {

    validateEmail(email){
        let errors = [];

        errors.push("Email is not an email")
        return errors
    }
     validatePassword(password){
         let errors = [];

         errors.push("Password is too short")
         errors.push("Password doesn't contain any special characters")
         return errors
     }
}