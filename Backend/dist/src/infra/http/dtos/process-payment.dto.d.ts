export declare class CardDataDto {
    number: string;
    cvc: string;
    expMonth: string;
    expYear: string;
    cardHolder: string;
}
export declare class ProcessPaymentDto {
    installments: number;
    card: CardDataDto;
}
