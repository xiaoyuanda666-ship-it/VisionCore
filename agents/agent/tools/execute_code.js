export function execute_code({ code }) {

  try {

    const result = eval(code);

    return String(result);

  } catch (err) {

    return "execute_code error: " + err.message;

  }

}