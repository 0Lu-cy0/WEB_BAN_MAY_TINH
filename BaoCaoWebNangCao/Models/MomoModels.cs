﻿using System;

namespace DoAn_LapTrinhWeb.Models
{
    public class MomoCreatePaymentResponseModel
    {
        public string RequestId { get; set; }
        public int ErrorCode { get; set; }
        public string OrderId { get; set; }
        public string Message { get; set; }
        public string LocalMessage { get; set; }
        public string RequestType { get; set; }
        public string PayUrl { get; set; }
        public string Signature { get; set; }
        public string QrCodeUrl { get; set; }
        public string Deeplink { get; set; }
        public string DeeplinkWebInApp { get; set; }
    }

    public class MomoExecuteResponseModel
    {
        public string PartnerCode { get; set; }
        public string OrderId { get; set; }
        public string RequestId { get; set; }
        public long Amount { get; set; }
        public string OrderInfo { get; set; }
        public string OrderType { get; set; } // Thêm thuộc tính OrderType
        public string TransId { get; set; }
        public int ErrorCode { get; set; }
        public string Message { get; set; }
        public string PayType { get; set; } // Thêm thuộc tính PayType
        public long ResponseTime { get; set; } // Thêm thuộc tính ResponseTime
        public string ExtraData { get; set; } // Thêm thuộc tính ExtraData
        public string Signature { get; set; }
    }

    public class MomoOptionModel
    {
        public string MomoApiUrl { get; set; }
        public string SecretKey { get; set; }
        public string AccessKey { get; set; }
        public string ReturnUrl { get; set; }
        public string NotifyUrl { get; set; }
        public string PartnerCode { get; set; }
        public string RequestType { get; set; }
    }

    public class OrderInfoModel
    {
        public string OrderId { get; set; }
        public string FullName { get; set; }
        public long Amount { get; set; }
        public string OrderInfo { get; set; }
    }
}