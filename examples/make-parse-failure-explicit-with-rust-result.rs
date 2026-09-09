#[derive(Debug, PartialEq)]
enum ParseFailure {
    InvalidInteger,
    OutOfRange,
}

fn parse_bounded(text: &str, min: i32, max: i32) -> Result<i32, ParseFailure> {
    let value = text.parse::<i32>().map_err(|_| ParseFailure::InvalidInteger)?;
    if value < min || value > max {
        return Err(ParseFailure::OutOfRange);
    }
    Ok(value)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reports_success_invalid_text_and_range_failure() {
        assert_eq!(parse_bounded("42", 0, 100), Ok(42));
        assert_eq!(parse_bounded("four", 0, 100), Err(ParseFailure::InvalidInteger));
        assert_eq!(parse_bounded("101", 0, 100), Err(ParseFailure::OutOfRange));
    }
}

fn main() {
    println!("{:?}", parse_bounded("42", 0, 100));
    println!("{:?}", parse_bounded("four", 0, 100));
}
