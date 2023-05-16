export class Device {
  constructor(
    public id: string, //Session Device ID
    public userId: string,
    public ip: string,
    public deviceName: string,
    public issuedAt: Date,
    public expirationDate: Date,
    public refreshTokenMeta: string,
  ) {}
}
