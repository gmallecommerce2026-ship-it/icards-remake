import { 
    Image, Type, Heart, Users, Calendar, Clock, 
    BookHeart, Phone, QrCode, CheckSquare, Code, LayoutTemplate 
} from 'lucide-react';

export const AVAILABLE_BLOCKS: Record<string, any> = {
    BANNER_CAROUSEL: { key: 'bannerImages', label: 'Banner Carousel', icon: <LayoutTemplate className="w-5 h-5" />, isList: true },
    EVENT_DESCRIPTION: { key: 'eventDescription', label: 'Câu chuyện / Lời mời', icon: <Type className="w-5 h-5" /> },
    COUPLE_INFO: { key: 'coupleInfo', label: 'Thông tin Cô dâu & Chú rể', icon: <Heart className="w-5 h-5" />, relatedFields: ['groomName', 'brideName'], titleKey: 'coupleTitle' },
    PARTICIPANTS: { key: 'participants', label: 'Thành viên tham gia', icon: <Users className="w-5 h-5" />, isList: true, titleKey: 'participantsTitle' },
    EVENT_SCHEDULE: { key: 'events', label: 'Lịch trình sự kiện', icon: <Calendar className="w-5 h-5" />, isList: true, titleKey: 'eventsTitle' },
    COUNTDOWN: { key: 'eventDate', label: 'Đếm ngược thời gian', icon: <Clock className="w-5 h-5" />, titleKey: 'countdownTitle' },
    LOVE_STORY: { key: 'loveStory', label: 'Chuyện tình yêu', icon: <BookHeart className="w-5 h-5" />, isList: true, titleKey: 'loveStoryTitle' },
    GALLERY: { key: 'galleryImages', label: 'Bộ sưu tập ảnh', icon: <Image className="w-5 h-5" />, isList: true, titleKey: 'galleryTitle' },
    VIDEO: { key: 'videoUrl', label: 'Video sự kiện', icon: <Image className="w-5 h-5" />, titleKey: 'videoTitle' },
    WISHES: { key: 'wishes', label: 'Sổ Lưu Bút', icon: <BookHeart className="w-5 h-5" />, titleKey: 'wishesTitle' },
    CONTACT_INFO: { key: 'contactInfo', label: 'Thông tin liên hệ', icon: <Phone className="w-5 h-5" />, titleKey: 'contactTitle' },
    QR_CODES: { key: 'qrCodes', label: 'Mã QR mừng cưới', icon: <QrCode className="w-5 h-5" />, isList: true, titleKey: 'qrCodeTitle' },
    RSVP: { key: 'rsvp', label: 'Xác Nhận Tham Dự', icon: <CheckSquare className="w-5 h-5" />, titleKey: 'rsvpTitle' },
    CUSTOM_HTML: { key: 'customHtmlContent', label: 'Khối tuỳ chỉnh', icon: <Code className="w-5 h-5" />, titleKey: 'customHtmlTitle' },
};