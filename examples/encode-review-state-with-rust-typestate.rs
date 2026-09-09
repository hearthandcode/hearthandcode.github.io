use std::marker::PhantomData;

/// A draft has no `release_candidate` method.
///
/// ```compile_fail,E0599
/// use std::marker::PhantomData;
/// struct Draft;
/// struct Reviewed;
/// struct Article<State> { _state: PhantomData<State> }
/// impl Article<Reviewed> { fn release_candidate(&self) {} }
/// let draft = Article::<Draft> { _state: PhantomData };
/// draft.release_candidate();
/// ```
#[allow(dead_code)]
fn draft_release_is_unavailable() {}

struct Draft;
struct Reviewed;

struct Article<State> {
    title: String,
    _state: PhantomData<State>,
}

impl Article<Draft> {
    fn new(title: &str) -> Self {
        Self { title: title.into(), _state: PhantomData }
    }

    fn review(self) -> Article<Reviewed> {
        Article { title: self.title, _state: PhantomData }
    }
}

impl Article<Reviewed> {
    fn release_candidate(&self) -> String {
        format!("candidate:{}", self.title)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reviewed_article_exposes_release_candidate() {
        let reviewed = Article::<Draft>::new("Guarded states").review();
        assert_eq!(reviewed.release_candidate(), "candidate:Guarded states");
    }
}

fn main() {
    let draft = Article::<Draft>::new("Guarded states");
    let reviewed = draft.review();
    println!("{}", reviewed.release_candidate());
}
