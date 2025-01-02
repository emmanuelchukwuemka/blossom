const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");

const favoriteProducts = expressAsyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user.id;

  const SQL = `
    SELECT 
      p.id AS product_id,
      p.title,
      p.description,
      p.images,
      p.price,
      p.categoryId,
      p.rating,
      p.percentageOff,
      p.soldCounter,
      p.active
    FROM 
      favorite_products fp
    INNER JOIN 
      products p 
    ON 
      fp.product_id = p.id
    WHERE 
      fp.user_id = ?
  `;
  db.query(SQL, [userId], (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Error fetching favorite products" });
    }
    return res.json(results);
  });
});

const favoriteSuppliers = expressAsyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user.id;

  const SQL = `
    SELECT 
      s.id AS supplier_id,
      s.name,
      s.years_in_industry,
      s.country,
      s.location,
      s.description,
      s.logo,
      s.is_verified,
      s.response_time,
      s.response_rate,
      s.no_of_transactions
    FROM 
      favorite_suppliers fs
    INNER JOIN 
      suppliers s 
    ON 
      fs.supplier_id = s.id
    WHERE 
      fs.user_id = ?
  `;
  db.query(SQL, [userId], (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Error fetching favorite suppliers" });
    }
    return res.json(results);
  });
});

const favoriteContents = expressAsyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user.id;

  const SQL = `
    SELECT 
      c.id AS content_id,
      c.title,
      c.body,
      c.files_id,
      c.files_url,
      c.type,
      c.created_at
    FROM 
      favorite_contents fc
    INNER JOIN 
      contents c 
    ON 
      fc.content_id = c.id
    WHERE 
      fc.user_id = ?
  `;
  db.query(SQL, [userId], (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Error fetching favorite contents" });
    }

    const contents = results.map((result) => {
      return {
        ...result,
        files: result.files_url.split(",").map((fileUrl) => ({ fileUrl })),
        file_ids: result.files_id.split(","),
      };
    });

    return res.json(contents);
  });
});

module.exports = {
  favoriteProducts,
  favoriteSuppliers,
  favoriteContents,
};
