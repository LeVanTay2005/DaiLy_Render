export interface WardData {
  name: string;
}

export interface DistrictData {
  name: string;
  wards: string[];
}

export interface ProvinceData {
  name: string;
  districts: DistrictData[];
}

export const VIETNAM_PROVINCES: ProvinceData[] = [
  {
    name: 'TP. Hồ Chí Minh',
    districts: [
      {
        name: 'Quận 1',
        wards: [
          'Phường Bến Nghé',
          'Phường Bến Thành',
          'Phường Đa Kao',
          'Phường Tân Định',
          'Phường Cầu Ông Lãnh',
          'Phường Cô Giang',
          'Phường Cầu Kho',
          'Phường Nguyễn Thái Bình',
          'Phường Phạm Ngũ Lão',
          'Phường Nguyễn Cư Trinh',
        ],
      },
      {
        name: 'Quận 3',
        wards: [
          'Phường Võ Thị Sáu',
          'Phường 1',
          'Phường 2',
          'Phường 3',
          'Phường 4',
          'Phường 5',
          'Phường 9',
          'Phường 10',
          'Phường 11',
          'Phường 12',
          'Phường 14',
        ],
      },
      {
        name: 'Quận 7',
        wards: [
          'Phường Tân Phong',
          'Phường Tân Phú',
          'Phường Tân Quy',
          'Phường Tân Kiểng',
          'Phường Tân Thuận Đông',
          'Phường Tân Thuận Tây',
          'Phường Phú Mỹ',
          'Phường Phú Thuận',
          'Phường Bình Thuận',
        ],
      },
      {
        name: 'Quận 10',
        wards: [
          'Phường 1',
          'Phường 2',
          'Phường 4',
          'Phường 5',
          'Phường 6',
          'Phường 7',
          'Phường 8',
          'Phường 9',
          'Phường 10',
          'Phường 11',
          'Phường 12',
          'Phường 13',
          'Phường 14',
          'Phường 15',
        ],
      },
      {
        name: 'TP. Thủ Đức',
        wards: [
          'Phường Thảo Điền',
          'Phường An Phú',
          'Phường An Khánh',
          'Phường Bình An',
          'Phường Thủ Thiêm',
          'Phường Hiệp Bình Chánh',
          'Phường Hiệp Bình Phước',
          'Phường Linh Trung',
          'Phường Linh Chiểu',
          'Phường Phước Long B',
          'Phường Tăng Nhơn Phú A',
        ],
      },
      {
        name: 'Quận Bình Thạnh',
        wards: [
          'Phường 1',
          'Phường 2',
          'Phường 3',
          'Phường 5',
          'Phường 6',
          'Phường 7',
          'Phường 11',
          'Phường 12',
          'Phường 13',
          'Phường 14',
          'Phường 15',
          'Phường 17',
          'Phường 19',
          'Phường 21',
          'Phường 22',
          'Phường 24',
          'Phường 25',
          'Phường 26',
        ],
      },
      {
        name: 'Quận Phú Nhuận',
        wards: [
          'Phường 1',
          'Phường 2',
          'Phường 3',
          'Phường 4',
          'Phường 5',
          'Phường 7',
          'Phường 8',
          'Phường 9',
          'Phường 10',
          'Phường 11',
          'Phường 13',
          'Phường 15',
          'Phường 17',
        ],
      },
      {
        name: 'Quận Tân Bình',
        wards: [
          'Phường 1',
          'Phường 2',
          'Phường 3',
          'Phường 4',
          'Phường 5',
          'Phường 6',
          'Phường 7',
          'Phường 8',
          'Phường 9',
          'Phường 10',
          'Phường 11',
          'Phường 12',
          'Phường 13',
          'Phường 14',
          'Phường 15',
        ],
      },
      {
        name: 'Quận Gò Vấp',
        wards: [
          'Phường 1',
          'Phường 3',
          'Phường 4',
          'Phường 5',
          'Phường 6',
          'Phường 7',
          'Phường 8',
          'Phường 9',
          'Phường 10',
          'Phường 11',
          'Phường 12',
          'Phường 13',
          'Phường 14',
          'Phường 15',
          'Phường 16',
          'Phường 17',
        ],
      },
    ],
  },
  {
    name: 'Hà Nội',
    districts: [
      {
        name: 'Quận Ba Đình',
        wards: [
          'Phường Cống Vị',
          'Phường Điện Biên',
          'Phường Đội Cấn',
          'Phường Giảng Võ',
          'Phường Kim Mã',
          'Phường Liễu Giai',
          'Phường Ngọc Hà',
          'Phường Ngọc Khánh',
          'Phường Nguyễn Trung Trực',
          'Phường Phúc Xá',
          'Phường Quán Thánh',
          'Phường Thành Công',
          'Phường Trúc Bạch',
          'Phường Vĩnh Phúc',
        ],
      },
      {
        name: 'Quận Hoàn Kiếm',
        wards: [
          'Phường Chương Dương',
          'Phường Cửa Đông',
          'Phường Cửa Nam',
          'Phường Đồng Xuân',
          'Phường Hàng Bạc',
          'Phường Hàng Bài',
          'Phường Hàng Bồ',
          'Phường Hàng Bông',
          'Phường Hàng Buồm',
          'Phường Hàng Đào',
          'Phường Hàng Gai',
          'Phường Hàng Mã',
          'Phường Hàng Trống',
          'Phường Lý Thái Tổ',
          'Phường Phan Chu Trinh',
          'Phường Phúc Tân',
          'Phường Tràng Tiền',
          'Phường Trần Hưng Đạo',
        ],
      },
      {
        name: 'Quận Cầu Giấy',
        wards: [
          'Phường Dịch Vọng',
          'Phường Dịch Vọng Hậu',
          'Phường Mai Dịch',
          'Phường Nghĩa Đô',
          'Phường Nghĩa Tân',
          'Phường Quan Hoa',
          'Phường Trung Hòa',
          'Phường Yên Hòa',
        ],
      },
      {
        name: 'Quận Đống Đa',
        wards: [
          'Phường Cát Linh',
          'Phường Hàng Bột',
          'Phường Khâm Thiên',
          'Phường Khương Thượng',
          'Phường Kim Liên',
          'Phường Láng Hạ',
          'Phường Láng Thượng',
          'Phường Nam Đồng',
          'Phường Ô Chợ Dừa',
          'Phường Phương Liên',
          'Phường Phương Mai',
          'Phường Quang Trung',
          'Phường Quốc Tử Giám',
          'Phường Thịnh Quang',
          'Phường Thổ Quan',
          'Phường Trung Liệt',
          'Phường Trung Phụng',
          'Phường Trung Tự',
          'Phường Văn Chương',
          'Phường Văn Miếu',
        ],
      },
      {
        name: 'Quận Tây Hồ',
        wards: [
          'Phường Bưởi',
          'Phường Nhật Tân',
          'Phường Phú Thượng',
          'Phường Quảng An',
          'Phường Thụy Khuê',
          'Phường Tứ Liên',
          'Phường Xuân La',
          'Phường Yên Phụ',
        ],
      },
      {
        name: 'Quận Nam Từ Liêm',
        wards: [
          'Phường Cầu Diễn',
          'Phường Đại Mỗ',
          'Phường Mễ Trì',
          'Phường Mỹ Đình 1',
          'Phường Mỹ Đình 2',
          'Phường Phú Đô',
          'Phường Tây Mỗ',
          'Phường Trung Văn',
          'Phường Xuân Phương',
        ],
      },
      {
        name: 'Quận Hà Đông',
        wards: [
          'Phường Biên Giang',
          'Phường Đồng Mai',
          'Phường Dương Nội',
          'Phường Hà Cầu',
          'Phường Kiến Hưng',
          'Phường La Khê',
          'Phường Mộ Lao',
          'Phường Nguyễn Trãi',
          'Phường Phú La',
          'Phường Phú Lãm',
          'Phường Phú Lương',
          'Phường Phúc La',
          'Phường Quang Trung',
          'Phường Vạn Phúc',
          'Phường Văn Quán',
          'Phường Yên Nghĩa',
          'Phường Yết Kiêu',
        ],
      },
    ],
  },
  {
    name: 'Đà Nẵng',
    districts: [
      {
        name: 'Quận Hải Châu',
        wards: [
          'Phường Hải Châu I',
          'Phường Hải Châu II',
          'Phường Thạch Thang',
          'Phường Thanh Bình',
          'Phường Thuận Phước',
          'Phường Hòa Thuận Đông',
          'Phường Hòa Thuận Tây',
          'Phường Nam Dương',
          'Phường Phước Ninh',
          'Phường Bình Thuận',
          'Phường Bình Hiên',
          'Phường Hòa Cường Bắc',
          'Phường Hòa Cường Nam',
        ],
      },
      {
        name: 'Quận Thanh Khê',
        wards: [
          'Phường Tam Thuận',
          'Phường Thanh Khê Đông',
          'Phường Thanh Khê Tây',
          'Phường Xuân Hà',
          'Phường Tân Chính',
          'Phường Chính Gián',
          'Phường Vĩnh Trung',
          'Phường Thạc Gián',
          'Phường An Khê',
          'Phường Hòa Khê',
        ],
      },
      {
        name: 'Quận Sơn Trà',
        wards: [
          'Phường An Hải Bắc',
          'Phường An Hải Đông',
          'Phường An Hải Tây',
          'Phường Mân Thái',
          'Phường Nại Hiên Đông',
          'Phường Phước Mỹ',
          'Phường Thọ Quang',
        ],
      },
      {
        name: 'Quận Ngũ Hành Sơn',
        wards: ['Phường Mỹ An', 'Phường Khuê Mỹ', 'Phường Hòa Quý', 'Phường Hòa Hải'],
      },
    ],
  },
  {
    name: 'Bình Dương',
    districts: [
      {
        name: 'TP. Thủ Dầu Một',
        wards: [
          'Phường Chánh Mỹ',
          'Phường Chánh Nghĩa',
          'Phường Định Hòa',
          'Phường Hiệp An',
          'Phường Hiệp Thành',
          'Phường Hòa Phú',
          'Phường Phú Cường',
          'Phường Phú Hòa',
          'Phường Phú Lợi',
          'Phường Phú Mỹ',
          'Phường Phú Tân',
          'Phường Phú Thọ',
          'Phường Tân An',
          'Phường Tương Bình Hiệp',
        ],
      },
      {
        name: 'TP. Thuận An',
        wards: [
          'Phường An Phú',
          'Phường An Thạnh',
          'Phường Bình Chuẩn',
          'Phường Bình Hòa',
          'Phường Bình Nhâm',
          'Phường Hưng Định',
          'Phường Lái Thiêu',
          'Phường Thuận Giao',
          'Phường Vĩnh Phú',
        ],
      },
      {
        name: 'TP. Dĩ An',
        wards: [
          'Phường An Bình',
          'Phường Bình An',
          'Phường Bình Thắng',
          'Phường Dĩ An',
          'Phường Đông Hòa',
          'Phường Tân Bình',
          'Phường Tân Đông Hiệp',
        ],
      },
    ],
  },
  {
    name: 'Đồng Nai',
    districts: [
      {
        name: 'TP. Biên Hòa',
        wards: [
          'Phường An Bình',
          'Phường Bửu Long',
          'Phường Hiệp Hòa',
          'Phường Hóa An',
          'Phường Hòa Bình',
          'Phường Hố Nai',
          'Phường Long Bình',
          'Phường Long Bình Tân',
          'Phường Quyết Thắng',
          'Phường Tam Hiệp',
          'Phường Tân Biên',
          'Phường Tân Hiệp',
          'Phường Tân Mai',
          'Phường Tân Phong',
          'Phường Tân Tiến',
          'Phường Tân Vạn',
          'Phường Thanh Bình',
          'Phường Thống Nhất',
          'Phường Trảng Dài',
          'Phường Trung Dũng',
        ],
      },
      {
        name: 'Huyện Long Thành',
        wards: ['Thị trấn Long Thành', 'Xã An Phước', 'Xã Bình Sơn', 'Xã Lộc An', 'Xã Long Đức', 'Xã Phước Thái'],
      },
    ],
  },
  {
    name: 'Hải Phòng',
    districts: [
      {
        name: 'Quận Hồng Bàng',
        wards: ['Phường Hoàng Văn Thụ', 'Phường Minh Khai', 'Phường Phan Bội Châu', 'Phường Quán Toan', 'Phường Sở Dầu', 'Phường Thượng Lý', 'Phường Trại Chuối'],
      },
      {
        name: 'Quận Ngô Quyền',
        wards: ['Phường Cầu Đất', 'Phường Cầu Tre', 'Phường Đằng Giang', 'Phường Đông Khê', 'Phường Đồng Quốc Bình', 'Phường Gia Viên', 'Phường Lạc Viên', 'Phường Lạch Tray', 'Phường Lê Lợi', 'Phường Máy Chai', 'Phường Máy Tơ', 'Phường Vạn Mỹ'],
      },
      {
        name: 'Quận Lê Chân',
        wards: ['Phường An Biên', 'Phường An Dương', 'Phường Cát Dài', 'Phường Dư Hàng', 'Phường Dư Hàng Kênh', 'Phường Hàng Kênh', 'Phường Hồ Nam', 'Phường Kênh Dương', 'Phường Lam Sơn', 'Phường Niệm Nghĩa', 'Phường Nghĩa Xá', 'Phường Trại Cau', 'Phường Trần Nguyên Hãn', 'Phường Vĩnh Niệm'],
      },
    ],
  },
  {
    name: 'Cần Thơ',
    districts: [
      {
        name: 'Quận Ninh Kiều',
        wards: ['Phường An Bình', 'Phường An Cư', 'Phường An Hòa', 'Phường An Khánh', 'Phường An Nghiệp', 'Phường Cái Khế', 'Phường Hưng Lợi', 'Phường Tân An', 'Phường Thới Bình', 'Phường Xuân Khánh'],
      },
      {
        name: 'Quận Cái Răng',
        wards: ['Phường Ba Láng', 'Phường Hưng Phú', 'Phường Hưng Thạnh', 'Phường Lê Bình', 'Phường Phú Thứ', 'Phường Tân Phú', 'Phường Thường Thạnh'],
      },
    ],
  },
  {
    name: 'Khánh Hòa',
    districts: [
      {
        name: 'TP. Nha Trang',
        wards: ['Phường Lộc Thọ', 'Phường Phước Tiến', 'Phường Tân Lập', 'Phường Vĩnh Hải', 'Phường Vĩnh Phước', 'Phường Vĩnh Thọ', 'Phường Xương Huân', 'Phường Phước Hải'],
      },
    ],
  },
  {
    name: 'Quảng Ninh',
    districts: [
      {
        name: 'TP. Hạ Long',
        wards: ['Phường Bãi Cháy', 'Phường Bạch Đằng', 'Phường Cao Thắng', 'Phường Cao Xanh', 'Phường Hòn Gai', 'Phường Hồng Gai', 'Phường Hồng Hà', 'Phường Hồng Hải', 'Phường Tuần Châu'],
      },
    ],
  },
];

/**
 * Validation checks
 */

// Phone: Vietnamese 10-digit mobile phone
export function validateVietnamesePhone(phone: string): { isValid: boolean; message: string } {
  const cleanPhone = phone.trim().replace(/[\s.-]/g, '');
  if (!cleanPhone) {
    return { isValid: false, message: 'Vui lòng nhập số điện thoại người nhận' };
  }
  const phoneRegex = /^(0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return {
      isValid: false,
      message: 'Số điện thoại không hợp lệ (Cần 10 chữ số, bắt đầu bằng 03, 05, 07, 08 hoặc 09)',
    };
  }
  return { isValid: true, message: '' };
}

// Vietnamese vowels regex (including all tonal diacritics)
export const VIETNAMESE_VOWEL_REGEX = /[aăâeêioôơuưyáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;

// Full Name: Must have at least 2 words, valid Vietnamese letters & vowels, no numbers/symbols or keyboard mashing
export function validateFullName(name: string): { isValid: boolean; message: string } {
  const clean = name.trim();
  if (!clean) {
    return { isValid: false, message: 'Vui lòng nhập họ và tên người nhận' };
  }

  // Reject 3+ repetitive letters in a row (e.g. "hhhhhh", "kkkkk", "aaaaa")
  if (/(.)\1{2,}/i.test(clean)) {
    return { isValid: false, message: 'Họ tên chứa ký tự lặp vô nghĩa. Vui lòng nhập tên chính xác.' };
  }

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    return { isValid: false, message: 'Vui lòng nhập đầy đủ cả Họ và Tên (Tối thiểu 2 từ)' };
  }

  if (/\d/.test(clean)) {
    return { isValid: false, message: 'Họ tên không được chứa chữ số' };
  }

  if (/[!@#$%^&*()_+=[\]{};:"\\|,.<>/?`~]/.test(clean)) {
    return { isValid: false, message: 'Họ tên không được chứa ký tự đặc biệt' };
  }

  // Check each word: must be at least 2 characters and contain valid vowels
  for (const word of words) {
    if (word.length < 2) {
      return { isValid: false, message: 'Mỗi từ trong họ tên phải có ít nhất 2 ký tự' };
    }
    if (!VIETNAMESE_VOWEL_REGEX.test(word)) {
      return {
        isValid: false,
        message: `Từ "${word}" không hợp lệ. Họ tên người nhận tiếng Việt phải có nguyên âm rõ ràng.`,
      };
    }
  }

  return { isValid: true, message: '' };
}

// Specific Address: Checks for realistic house/street info, rejecting senseless keyboard mashing like "dsadsd", "kkjk kjk jjk"
export function validateSpecificAddress(address: string): { isValid: boolean; message: string } {
  const clean = address.trim();
  if (!clean) {
    return { isValid: false, message: 'Vui lòng nhập địa chỉ cụ thể (Số nhà, tên đường, tòa nhà)' };
  }

  if (clean.length < 7) {
    return {
      isValid: false,
      message: 'Địa chỉ quá ngắn (Tối thiểu 7 ký tự). Vui lòng ghi rõ số nhà, ngõ/hẻm hoặc tên đường.',
    };
  }

  // Check for repeated character mashing (e.g. "aaaaa", "ddddd", "sssss", "hhhhh")
  if (/(.)\1{2,}/i.test(clean)) {
    return {
      isValid: false,
      message: 'Địa chỉ chứa chuỗi ký tự lặp vô nghĩa. Vui lòng nhập địa chỉ giao hàng chính xác.',
    };
  }

  // Common keyboard mashing phrases
  const spamKeywords = [
    'dsadsd',
    'dsad',
    'asdasd',
    'asdf',
    'qwerty',
    'zxcv',
    'ghjk',
    '123123',
    '123456',
    'test',
    'abcxyz',
    'aaaa',
    'zzzz',
    'xxxx',
    'kkjk',
    'jjk',
    'hhhh',
  ];
  const lower = clean.toLowerCase();
  for (const spam of spamKeywords) {
    if (lower === spam || lower.split(/\s+/).includes(spam)) {
      return {
        isValid: false,
        message: 'Địa chỉ không hợp lệ. Vui lòng ghi rõ số nhà, tên đường hoặc toà nhà/cơ sở spa.',
      };
    }
  }

  // Words breakdown
  const words = clean.split(/\s+/).filter(Boolean);
  const letterWords = words.filter(w => /[a-zA-Zà-ỹÀ-Ỹ]/.test(w));

  // Every letter word must have at least one vowel (rejects consonant strings like "kkjk", "kjk", "jjk", "dsds")
  const invalidVowelWords = letterWords.filter(w => !VIETNAMESE_VOWEL_REGEX.test(w) && !/\d/.test(w));
  if (invalidVowelWords.length > 0) {
    return {
      isValid: false,
      message: `Địa chỉ chứa từ không có nghĩa: "${invalidVowelWords.join(', ')}". Vui lòng nhập tên đường hoặc số nhà thực tế.`,
    };
  }

  // Must contain either:
  // 1. Street prefix (số, đường, phố, ngõ, hẻm, tòa, căn, chung cư, ấp, thôn, tổ, kđt...)
  // 2. OR numeric house number (e.g. 12, 125/4, 280A) along with a valid street name
  const hasStreetIndicator =
    /(số|đường|phố|ngõ|ngách|hẻm|tòa|toà|tầng|căn|chung cư|kđt|khu|lô|quốc lộ|ql|ấp|thôn|tổ|khóm|đoàn|sala|vinhomes|landmark|nguyễn|lê|trần|hoàng|phạm|huỳnh|võ|phan|bùi|đặng|đỗ|hồ|ngô|dương|lý)/i.test(
      clean
    );
  const hasNumber = /\d/.test(clean);

  if (!hasStreetIndicator && !hasNumber) {
    return {
      isValid: false,
      message: 'Vui lòng nhập rõ số nhà hoặc tên đường (Ví dụ: "Số 45 Lê Lợi" hoặc "125/4 Nguyễn Trãi").',
    };
  }

  if (words.length < 2) {
    return {
      isValid: false,
      message: 'Vui lòng nhập đầy đủ cả số nhà và tên đường (Ví dụ: "125 Nguyễn Huệ").',
    };
  }

  return { isValid: true, message: '' };
}

// Email: Standard email validation
export function validateEmail(email: string): { isValid: boolean; message: string } {
  const clean = email.trim();
  if (!clean) return { isValid: true, message: '' }; // Optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clean)) {
    return { isValid: false, message: 'Định dạng email không hợp lệ (Ví dụ: clinic@gmail.com)' };
  }
  return { isValid: true, message: '' };
}

// Tax ID: 10 or 13 digits for Vietnamese enterprise VAT invoice
export function validateTaxId(taxId: string): { isValid: boolean; message: string } {
  const clean = taxId.trim().replace(/[-\s]/g, '');
  if (!clean) {
    return { isValid: false, message: 'Vui lòng nhập mã số thuế công ty' };
  }
  if (!/^\d{10}(\d{3})?$/.test(clean)) {
    return { isValid: false, message: 'Mã số thuế doanh nghiệp phải gồm 10 hoặc 13 chữ số' };
  }
  return { isValid: true, message: '' };
}
