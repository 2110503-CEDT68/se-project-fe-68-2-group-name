export interface CoworkingSpace {
    _id: string;
    name: string;
    address: string;
    tel: string;
    openCloseTime: string;
    description: string;
    imageUrl: string;
    price: string;
}

export interface CommentItem {
    _id: string;
    message: string;
    rating?: number;
    coworkingSpace: string;
    user: {
        _id: string;
        name?: string;
        email?: string;
    } | string;
    createdAt: string;
}