DELETE FROM "reviews"
WHERE "id" IN (
  SELECT duplicate_reviews."id"
  FROM (
    SELECT
      "id",
      ROW_NUMBER() OVER (
        PARTITION BY "productId", "userId"
        ORDER BY "date" ASC, "id" ASC
      ) AS row_number
    FROM "reviews"
    WHERE "userId" IS NOT NULL
  ) AS duplicate_reviews
  WHERE duplicate_reviews.row_number > 1
);

UPDATE "products" AS product
SET
  "rating" = COALESCE(review_stats.average_rating, 0),
  "reviewsCount" = COALESCE(review_stats.review_count, 0)
FROM (
  SELECT
    "productId",
    AVG("rating")::DECIMAL(3, 2) AS average_rating,
    COUNT(*)::INTEGER AS review_count
  FROM "reviews"
  GROUP BY "productId"
) AS review_stats
WHERE product."id" = review_stats."productId";

UPDATE "products"
SET
  "rating" = 0,
  "reviewsCount" = 0
WHERE "id" NOT IN (
  SELECT DISTINCT "productId"
  FROM "reviews"
);

CREATE UNIQUE INDEX "reviews_productId_userId_key"
ON "reviews" ("productId", "userId");
