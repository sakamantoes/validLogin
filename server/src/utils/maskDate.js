export const maskEmail = (email) => {
  const [name, domain] = email.split("@");

  if (name.length <= 3) {
    return name[0] + "***@" + domain;
  }

  return (
    name.substring(0, 3) +
    "***" +
    name.substring(name.length - 2) +
    "@" +
    domain
  );
};

export const maskPassword = (password) => {
  if (password.length <= 2) {
    return "**";
  }

  return password[0] + "***" + password[password.length - 1];
};

