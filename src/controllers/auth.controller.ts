import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Session } from "../entity/Session";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getIO } from "../socket/socket";

const userRepo = AppDataSource.getRepository(User);
const sessionRepo = AppDataSource.getRepository(Session);

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(409).send({ message: "All parameters are required" });
    }

    //check email exist or not
    const checkUser = await userRepo.findOneBy({ email });

    if (checkUser) {
      return res
        .status(409)
        .send({ message: "User with Email Already registerd." });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    const user = new User();

    user.name = name;
    user.email = email;
    user.password = hashPassword;
    user.createAt = new Date();

    await userRepo.save(user);

    // event is triggere on user registeration
    getIO().emit("userRegistered", {
      name: user.name,
    });

    return res.status(200).send({ message: "User Registered." });
  } catch (error) {
    console.log(error);
    next(new Error(error.mressage));
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(409)
        .send({ message: "Email and Password Are Required." });
    }

    // check email
    const checkEmail = await userRepo.findOneBy({ email });
    if (!checkEmail) {
      return res.status(409).send({ message: "Invalid Credentials." });
    }

    // compare password
    if (!bcrypt.compareSync(password, checkEmail.password)) {
      return res.status(409).send({ message: "Invalid Credential." });
    }

    //create token
    const accessToken = jwt.sign(
      {
        userId: checkEmail.id,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      {
        userId: checkEmail.id,
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // check session token in db
    const checkSession = await sessionRepo.findOneBy({ userId: checkEmail.id });

    // for single devide session
    if (checkSession) {
      await sessionRepo.delete({ userId: checkEmail.id });
    }

    const createSession = new Session();

    createSession.userId = checkEmail.id;
    createSession.refreshToken = refreshToken;
    createSession.createAt = new Date();

    await sessionRepo.save(createSession);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV == "production",
    });

    return res.send({ message: "Login Successful", accessToken });
  } catch (error) {
    next(new Error(error.mressage));
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies["refreshToken"];
    if (!refreshToken) {
      return res.status(401).send({ message: "Session Expired." });
    }

    const data = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    let userId: number | undefined;
    if (typeof data === "object" && data !== null && "userId" in data) {
      userId = (data as any).userId;
    }

    if (!userId) {
      return res.status(401).send({ message: "Invalid token payload." });
    }

    const checkSession = await sessionRepo.findOneBy({
      userId: userId,
    });

    if (checkSession) {
      await sessionRepo.delete({ userId: userId });
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV == "production",
    });

    return res.status(200).send({ message: "Logout Successfull." });
  } catch (error) {
    next(new Error(error.mressage));
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionToken = req.cookies["refreshToken"];
    if (!sessionToken) {
      return res.status(401).send({ message: "No Refresh Token Provided" });
    }
    const session = await sessionRepo.findOne({
      where: {
        refreshToken: sessionToken,
      },
    });

    if (!session) {
      return res.status(409).send({ message: "Invalid Token" });
    }

    const verifyToken = jwt.verify(
      sessionToken,
      process.env.JWT_REFRESH_SECRET
    );

    let userId: number | undefined;
    if (
      typeof verifyToken === "object" &&
      verifyToken !== null &&
      "userId" in verifyToken
    ) {
      userId = (verifyToken as any).userId;
    }

    if (!userId) {
      return res.status(401).send({ message: "Invalid token payload." });
    }
    // create new accessToken
    //create token
    const accessToken = jwt.sign(
      {
        userId: userId,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    return res.send({ message: "aceess token refreshed", accessToken });
  } catch (error) {
    next(new Error(error.message));
  }
};
