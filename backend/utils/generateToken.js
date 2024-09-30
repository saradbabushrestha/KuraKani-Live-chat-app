import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 10000, //mx
    httpOnly: true, //prevent XSS attack
    sameSize: "strict", //CSRF attack
    secure: process.env.NODE_ENV !== "development",
  });
};
export default generateTokenAndSetCookie;
