const validator = require("validator");

const validateUser = (req) => {
  const { email, password } = req.body;
  if (!validator.isEmail(email)) {
    throw new Error(
      "Please enter a valid email address in the format 'example@domain.com'."
    );
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 0,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new Error(
      "Password must be at least 8 characters long, include a number and a symbol."
    );
  }
};

module.exports = {
  validateUser,
};
