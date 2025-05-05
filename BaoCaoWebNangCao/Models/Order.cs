using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;
using DoAn_LapTrinhWeb.Models;

namespace DoAn_LapTrinhWeb.Model
{
    [Table("Order")]
    public class Order
    {
        [SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Order()
        {
            Oder_Detail = new HashSet<Oder_Detail>();
        }

        [Key]
        public int order_id { get; set; }

        [Column("order_address_id")]
        public int? orderAddressId { get; set; }

        public int? payment_id { get; set; }
        public int? delivery_id { get; set; }
        public DateTime? order_date { get; set; } // S?a t�n v� th�m ?
        public int? account_id { get; set; }
        [StringLength(1)]
        public string status { get; set; } // C� th? ?? string nullable n?u c?n
        [StringLength(400)] // S?a ?? d�i
        public string order_note { get; set; }
        public DateTime? create_at { get; set; } // Th�m ?
        public float? total { get; set; } // S?a th�nh float? ?? kh?p v?i DB v� d�ng ??
        [StringLength(100)]
        public string create_by { get; set; } // X�a [Required]
        [StringLength(200)] // S?a ?? d�i
        public string update_by { get; set; } // X�a [Required]
        public DateTime? update_at { get; set; } // Th�m ?

        public virtual Account Account { get; set; }
        public virtual Delivery Delivery { get; set; }
        [SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Oder_Detail> Oder_Detail { get; set; }
        public virtual Payment Payment { get; set; }
        public virtual OrderAddress OrderAddress { get; set; }
    }
}