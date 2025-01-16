package controller

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    "Cart/entity"
)

// รายงานยอดขาย
// Modify this function in admin_controller.go

func GetSalesReport(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    var report struct {
        TotalSales     float64 `json:"total_sales"`
        OrderCount     int64   `json:"order_count"`  // Changed from int to int64
        AverageOrder   float64 `json:"average_order"`
        TopProducts    []struct {
            Name      string  `json:"name"`
            Quantity  int     `json:"quantity"`
            Revenue   float64 `json:"revenue"`
        } `json:"top_products"`
    }

    // Calculate total sales
    db.Model(&entity.Order{}).
        Select("COALESCE(SUM(total_price), 0)").
        Where("status = ?", "completed").
        Scan(&report.TotalSales)

    // Count orders
    db.Model(&entity.Order{}).
        Where("status = ?", "completed").
        Count(&report.OrderCount)

    // Calculate average order value
    if report.OrderCount > 0 {
        report.AverageOrder = report.TotalSales / float64(report.OrderCount)
    }

    c.JSON(http.StatusOK, report)
}

// รายงานสต็อก
func GetStockReport(c *gin.Context) {
    db := c.MustGet("db").(*gorm.DB)
    var report struct {
        LowStock []struct {
            ProductName string `json:"product_name"`
            Color      string `json:"color"`
            Size       string `json:"size"`
            Quantity   int    `json:"quantity"`
            MinQuantity int   `json:"min_quantity"`
        } `json:"low_stock"`
        OutOfStock []struct {
            ProductName string `json:"product_name"`
            Color      string `json:"color"`
            Size       string `json:"size"`
        } `json:"out_of_stock"`
    }

    // ดึงรายการสินค้าที่ใกล้หมด
    db.Table("stocks").
        Select("products.name as product_name, stocks.color, stocks.size, stocks.quantity, stocks.min_quantity").
        Joins("left join products on stocks.product_id = products.id").
        Where("stocks.quantity <= stocks.min_quantity AND stocks.quantity > 0").
        Scan(&report.LowStock)

    // ดึงรายการสินค้าที่หมด
    db.Table("stocks").
        Select("products.name as product_name, stocks.color, stocks.size").
        Joins("left join products on stocks.product_id = products.id").
        Where("stocks.quantity = 0").
        Scan(&report.OutOfStock)

    c.JSON(http.StatusOK, report)
}