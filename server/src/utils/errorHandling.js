export const errorHandler500 = (error, res) => {
  console.log(error);

  res.status(500).send({ error: 'Internal Server Error' });
};
