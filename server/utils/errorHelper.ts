import Boom from "@hapi/boom";

const handleError = (err: any) => {
  if (err?.isBoom) {
    throw err;
  } else {
    console.error(err);
    throw Boom.badImplementation(err);
  }
}

export default handleError