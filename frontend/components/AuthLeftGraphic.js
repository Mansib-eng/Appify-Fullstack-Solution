export default function AuthLeftGraphic({ image, alt, secondaryImage }) {
  return (
    <div className="_social_login_left">
      <div className="_social_login_left_image">
        <img src={image} alt={alt} className="_left_img" />
      </div>
      {secondaryImage ? (
        <div className="_social_registration_right_image_dark">
          <img src={secondaryImage} alt={alt} />
        </div>
      ) : null}
    </div>
  );
}
