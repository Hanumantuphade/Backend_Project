const asyncHandler = (requestHandler) => {
 return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
     res.status(error.code || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    });
  };
};

export { asyncHandler };  

// Another way to Handle it

// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message || "Internal Server Error",
//       stack: process.env.NODE_ENV === "production" ? null : error.stack,
//     });
//   }
// };
