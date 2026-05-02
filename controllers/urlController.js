

const { nanoid } = require("nanoid");
const Url = require("../models/Url");


const createShortUrl = async (req, res, next) => {
  try {
    const { longUrl } = req.body;


    const existingUrl = await Url.findOne({ longUrl });
    if (existingUrl) {
      return res.status(200).json({
        success: true,
        message: "Short URL already exists for this long URL.",
        shortUrl: `${process.env.BASE_URL}/${existingUrl.shortID}`,
        data: existingUrl,
      });
    }


    const shortID = nanoid(8);


    const newUrl = await Url.create({
      shortID,
      longUrl,
    });


    return res.status(201).json({
      success: true,
      message: "Short URL created successfully.",
      shortUrl: `${process.env.BASE_URL}/${newUrl.shortID}`,
      data: newUrl,
    });
  } catch (error) {

    next(error);
  }
};


const redirectUrl = async (req, res, next) => {
  try {
    const { shortID } = req.params;


    const urlDoc = await Url.findOneAndUpdate(
      { shortID },
      { $inc: { accessCount: 1 } },
      { new: true }
    );


    if (!urlDoc) {
      return res.status(404).json({
        success: false,
        message: `No URL found for shortID: "${shortID}".`,
      });
    }


    return res.redirect(urlDoc.longUrl);
  } catch (error) {
    next(error);
  }
};


const updateUrl = async (req, res, next) => {
  try {
    const { shortID } = req.params;
    const { longUrl, accessCount } = req.body;


    const updateFields = {};
    if (longUrl !== undefined)      updateFields.longUrl = longUrl;
    if (accessCount !== undefined)  updateFields.accessCount = accessCount;


    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update: longUrl or accessCount.",
      });
    }


    const updatedUrl = await Url.findOneAndUpdate(
      { shortID },
      { $set: updateFields },
      {
        new: true,
        runValidators: true
      }
    );


    if (!updatedUrl) {
      return res.status(404).json({
        success: false,
        message: `No URL found for shortID: "${shortID}".`,
      });
    }


    return res.status(200).json({
      success: true,
      message: "URL updated successfully.",
      data: updatedUrl,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createShortUrl, redirectUrl, updateUrl };
