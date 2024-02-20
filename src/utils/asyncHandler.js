// const asyncHandler = () =>{}

// Function which we are accepting in params, we want to pass in another function

// const asyncHandler = (func) => {()=>{}}
// const asyncHandler = (func) => ()=>{}

// This is a wrapper function

// const asyncHandler = (func) => async (req, res, next) => {
//   try {
//     await func(req, res, next);
//   } catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// Same using promises

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));

    // Catch = reject
  };
};

export { asyncHandler };
